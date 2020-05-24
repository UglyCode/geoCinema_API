const {Client} = require('pg');
const DATABASE_LINK = process.env.DATABASE_URL ||
    'postgres://postgres:kloop12@localhost:5432/postgres';

const client = new Client({
    connectionString: DATABASE_LINK,
});
client.connect().catch(e => handleLocalError(e));

const handleTableGet = (req,res) => {
    if (!req.params.table_name){
        noTableNameHandler(res);
        return;
    }
    const table = req.params.table_name;

    client.query(`SELECT * FROM public.${table};`)
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));
};

const handleTablePost = (req, res) => {
    if (!req.params.table_name){
        noTableNameHandler(res);
        return;
    }
    const table = req.params.table_name;
    const payload = req.body;

    client.query(
        `INSERT INTO public.${table} (${Object.keys(payload[0]).join(',')})
        VALUES ${payload.reduce((accum, elem, i, arr) => {
        accum += `(${createValuesInsertString(Object.values(elem))})` + ((arr.length-1 === i) ? ' ':', ');
        return accum;
        }, '')};`
    )
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));

};

const createValuesInsertString = (arr) => {
   const valuesString = arr.reduce((accum, elem, i, arr) => {

        let result;
        //special values
        switch (elem) {
            case 'now()': result = elem;
        }

        //usual values
        if (!result) {
            switch (typeof elem) {
                case "string":
                    result = `'${elem}'`;
                    break;
                case "number":
                    result = `${elem}`;
                    break;
                case "boolean":
                    result = `${elem.toString()}`;
                    break;
                default:
                    result = '';
            }
        }

        accum += result + ((arr.length - 1 === i) ? '' : ',');
        return accum;

    },'');

   return valuesString;
};

const sendQueryResult = (queryResult, res) => {

    let resBody = queryResult.rows;

    if (!resBody || !Array.isArray(resBody)){
        res.status(500);
        resBody = 'Invalid query result';
    } else if (resBody.length === 0){
        resBody = 'Query result is empty';
    }

    res.json(resBody);
};

const noTableNameHandler = (res) => {
    res.status(400).json('no table name passed.');
};

const handleLocalError = (e, res) => {
    console.log('--error: ' + e);
    console.log('-- at: ' + e.stack);
    res.status(500).json(e.stack);
};

module.exports = {handleTableGet, handleTablePost};