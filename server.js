const express = require('express');
const bp = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const pgHandlers = require('./controllers/postgres');

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use('/static',express.static(__dirname + '/public'));
app.use(bp.json());

app.get('/films', (req, res) => pgHandlers.handleFilmsGet(req, res));
app.get('/cinemas/:filmId', (req, res) => pgHandlers.handleCinemasGet(req, res));



const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
   console.log(`server started at port: ${PORT}`);
});
