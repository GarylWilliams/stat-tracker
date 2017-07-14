const Activity = require('../../models/activity');
const ActivityList = require('../../models/activitylist');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

//Routes for /api/authenticate/

router.post('/', function (req, res) {
    let username = req.body.username,
        password = req.body.password;

    if (!(username && password)) {
        res.json({
            success: false,
            message: "Username or password not provided."
        });
    } else {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) res.json({
                success: false,
                message: "Error getting users."
            });

            if (!user) {
                res.json({
                    success: false,
                    message: "Authentication failed: user not found."
                });
            } else {
                if (user.password != password) {
                    res.json({
                        success: false,
                        message: "Authentication failed: wrong password"
                    });
                } else {
                    //Create token
                    let token = jwt.sign(user, 'somesecret', {
                        expiresIn: 60 * 60 * 24 //Expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: "Token generated successfully",
                        token: token
                    });
                }
            }
        });
    }
})



module.exports = router;
