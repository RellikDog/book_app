'use strict';

//Application Dependencies
const express = require('express');
// const pg = require('pg');
// const cors = require('cors');
// const superAgent = require('superagent');

//Load env vars;
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
//------------------------------------------------
app.get('/', test);

function test(req, res){
    res.render('pages/index').catch(err => {
        console.log(err);
    });
}



app.listen(PORT, () => {
    console.log(`app is up on port : ${PORT}`);
  });
