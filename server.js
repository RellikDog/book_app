'use strict';

// //Application Dependencies
// const express = require('express');
// const pg = require('pg');
// const cors = require('cors');
// const superAgent = require('superagent');

// //Load env vars;
// require('dotenv').config();

// const PORT = process.env.PORT;

const express = require('express');

const superagent = require('superagent');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

app.get('/', home);

function home(request, response){
  response.render('pages/index');
}

app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));