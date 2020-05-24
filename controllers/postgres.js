const {Client} = require('pg');
const DATABASE_LINK = process.env.HEROKU_POSTGRESQL_COBALT_URL ||
    'postgres://postgres:kloop12@localhost:5432/postgres';

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
    if (!req.params.filmId){
        noFilmIdHandler(res);
        return;
    }

    client.query(
        `SELECT * from cinemas
                where id in (select cinema from schedules where film = ${req.params.filmId})`
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

const noFilmIdHandler = (res) => {
    res.status(400).json('Error. no film ID passed!');
};

const handleLocalError = (e, res) => {
    console.log('--error: ' + e);
    console.log('-- at: ' + e.stack);
    res.status(500).json(e.stack);
};

module.exports = {handleFilmsGet, handleCinemasGet};