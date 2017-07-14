const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.connect("mongodb://localhost:27017/stat-tracker");

//Define public api routes
const createUser = require('../routes/api/createuser')
const authenticate = require('../routes/api/authenticate');
app.use('/api/createuser', createUser);
app.use('/api/authenticate', authenticate);

//Define public user routes
const register = require('../routes/register');
const login = require('../routes/login');
app.use('/register', register);
app.use('/login', login);

//route middleware for authentication with token
app.use(function (req, res, next) {
    // check header, url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        //verify secret
        jwt.verify(token, 'somesecret', function (err, decoded) {
            if (err)
                return res.json({
                    success: false,
                    message: "Failed to authenticate token."
                });
            else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: "No token provided"
        });
    }
})

/* ----- Below routes require token -------- */

//Define protected api routes
const activities = require('../routes/api/activities');
const stats = require('../routes/api/stats');
app.use('/api/activities', activities);
app.use('/api/stats', stats);

//Define protected user routes
const home = require('../routes/home');
app.use('/home', home);

app.get('/', function(req, res) {
    res.send(404);
})

app.listen(3000, () => {
    console.log("App started");
})

module.exports = app;