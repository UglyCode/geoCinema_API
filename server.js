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

// app.get('/:table_name', (req, res) => pgHandlers.handleTableGet(req, res));
// app.post('/:table_name', (req, res) => pgHandlers.handleTablePost(req, res));



const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
   console.log(`server started at port: ${PORT}`);
});
