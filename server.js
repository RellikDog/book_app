'use strict';

//Application Dependencies
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superAgent = require('superagent');

//Load env vars;
require('dotenv').config();

const PORT = process.env.PORT;