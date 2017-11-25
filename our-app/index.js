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

/* Static pages */
app.get('/', (req, res) => {
    res.sendFile(path.resolve('./web/index.html'));
});

app.get('/add', (req, res) => {
    console.log("Latitude: " + req.query['latitude']);
    console.log("Longitude: " + req.query['longitude']);


    res.sendFile(path.resolve('./web/add.html'));
});

app.get('/show', (req, res) => {
    res.sendFile(path.resolve('./web/show.html'));
});




app.listen(3001, () => console.log('Example app listening on port 3001!'));