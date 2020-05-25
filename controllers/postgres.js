const {Client} = require('pg');
const DATABASE_LINK = process.env.HEROKU_POSTGRESQL_COBALT_URL ||
    'postgres://postgres:kloop12@localhost:5432/postgres';

const types = require('pg').types;
types.setTypeParser(1700, 'text', parseFloat);

const client = new Client({
    connectionString: DATABASE_LINK,
});
client.connect().catch(e => handleLocalError(e));

const handleFilmsGet = (req,res) => {

    client.query(`SELECT * FROM public.films;`)
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));
};

const handleCinemasGet = (req, res) => {

    client.query(
        `SELECT DISTINCT * from cinemas
                where id in (select cinema from schedules where film = ${req.params.filmId})`
    )
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));

};

const handleCinemasListGet = (req, res) => {

    client.query(
        `SELECT * from cinemas`
    )
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));

};

const handleSessionsGet = (req, res) => {

    if (!checkParams(req, res, ['filmId','cinemaId'])) return;

    client.query(
        `SELECT * from schedule where film = ${req.query.filmId} and cinema = ${req.query.cinemaId}`
    )
        .then(result => sendQueryResult(result, res))
        .catch(e => handleLocalError(e,res));

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

const checkParams = (req, res, obligatoryParams) => {

    let errorString = obligatoryParams.reduce((accum,elem) =>{
        if (!req.params[elem] && !req.query[elem]) return accum += `#${elem} `;
        return accum;
    }, '');

    if (errorString.length){
        res.status(400).json(`Error. no ${erorString}passed!`);
        return false;
    } else {
        return true;
    }
};

const handleLocalError = (e, res) => {
    console.log('--error: ' + e);
    console.log('-- at: ' + e.stack);
    res.status(500).json(e.stack);
};

module.exports = {handleFilmsGet, handleCinemasGet,
    handleCinemasListGet, handleSessionsGet};