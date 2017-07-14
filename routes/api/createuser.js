const Activity = require('../../models/activity');
const ActivityList = require('../../models/activitylist');
const User = require('../../models/user');
const express = require('express');
const router = express.Router();

//Routes for /api/authenticate/

router.post('/', function (req, res) {
    let username = req.body.username,
        password = req.body.password,
        email = req.body.email;

    if (!(username && password && email)) {
        res.json({
            success: false,
            message: "Not all required fields were provided."
        });
    } else {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) res.json({
                success: false,
                message: "Error retrieving users."
            });

            if (!user.length) {
                //Add user to db
                let newuser = new User({
                    username: username,
                    password: password,
                    email: email,
                    createdAt: new Date()
                });

                newuser.save(function (err) {
                    if (err) res.json({
                        success: false,
                        message: "Error saving new user."
                    });

                    console.log("New user created successfully: ");
                    console.dir(newuser);
                    res.json({
                        success: true,
                        data: newuser
                    });
                });

            } else {
                //user already exists
                res.json({
                    success: false,
                    message: "That username already exists.",
                    user: user
                });
            }
        });
    }
})



module.exports = router;
