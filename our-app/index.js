const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise');
const path = require('path');
const _ = require("underscore");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./web')));

// app.get('/', (req, res) => res.send('Hello World!'));

app.listen(3001, () => console.log('Example app listening on port 3001!'));