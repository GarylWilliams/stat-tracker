const Activity = require('../../models/activity');
const ActivityList = require('../../models/activitylist');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

//Routes for /api/activities/


//Responds with list of activities with links to individual activity pages
router.get('/', function (req, res) {
    ActivityList.find({
        owner_id: req.decoded['$__']['_id']
    }, function (err, activitylists) {
        if (err) res.json({
            success: false,
            message: "Error retrieving activity lists. "
        });

        else if (!activitylists) res.json({
            success: false,
            message: "No activity lists found."
        });

        else if (activitylists) {
            res.json({
                success: true,
                data: activitylists,
            });
        }
    })
})

//Creates a new activity and responds with success or failure
router.post('/', function (req, res) {
    let title = req.body.title,
        description = req.body.description,
        column_title = req.body.column_title;

    if (!(title && description && column_title)) {
        res.json({
            success: false,
            message: "Not all required fields were provided."
        });
    } else {

        ActivityList.find({
            title: title,
            owner_id: req.decoded['$__']['_id']
        }, function (err, activitylists) {

            if (err) res.json({
                success: false,
                message: "Error retrieving activity lists. "
            });

            //Activity list already exists under that name.
            else if (activitylists.length > 0) {
                res.json({
                    success: false,
                    message: "An activity with that name already exists.",
                    activitylists: activitylists
                })
            }

            //Create new activity list
            else if (!activitylists.length) {
                let newlist = new ActivityList({
                    owner_id: req.decoded['$__']['_id'],
                    title: title,
                    description: description,
                    column_title: column_title,
                    activity_ids: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                newlist.save(function (err) {
                    if (err) res.json({
                        success: false,
                        message: "Error saving new activity list: " + err
                    });

                    else {
                        //Add new list to user activity_listids 

                        res.json({
                            success: true,
                            data: newlist
                        });
                    }
                });
            }

        })
    }
})

//Returns list of data recorded for one activity by ID
router.get('/:id', function (req, res) {
    let id = req.params.id;
    ActivityList.findOne({
        _id: id,
        owner_id: req.decoded['$__']['_id']
    }, function (err, activitylist) {
        if (err) res.json({
            success: false,
            message: "Error retrieving activity list by id: " + id
        });

        else if (!activitylist) res.json({
            success: false,
            message: "No activity list found as id: " + id,
            //activitylist: activitylist
        });

        else if (activitylist) res.json({
            success: true,
            data: activitylist
        })
    });
})

//Update one activity being tracked by ID (title, column) and responds with success or failure
router.put('/:id', function (req, res) {
    let id = req.params.id,
        title = req.body.title,
        column_title = req.body.column_title

    if (!(title && column_title)) {
        res.json({
            success: false,
            message: "Not all required fields were provided."
        });
    } else {
        ActivityList.findOne({
            _id: id,
            owner_id: req.decoded['$__']['_id']
        }, function (err, activitylist) {
            if (err) res.json({
                success: false,
                message: "Error finding activitylist by id."
            });

            else if (!activitylist) res.json({
                success: false,
                message: "Could not find an activity list by given ID."
            });

            else if (activitylist) {
                activitylist.title = title;
                activitylist.column_title = column_title;
                activitylist.save(function (err) {
                    if (err) res.json({
                        success: false,
                        message: "Error updating activitylist -> err: " + err
                    });
                    else res.json({
                        success: true,
                        activitylist: activitylist
                    });
                });
            }
        });
    }
})

//Deletes one activity and responds with success or failure
router.delete('/:id', function (req, res) {
    let id = req.params.id;

    ActivityList.findOne({
        _id: id,
        owner_id: req.decoded['$__']['_id']
    }, function (err, activitylist) {
        if (err) res.json({
            success: false,
            message: "Error deleting activity list. -> err" + err
        });
        else if (!activitylist) res.json({
            success: false,
            message: "Could not find activity list by given ID."
        })
        else if (activitylist) {
            res.json({
                success: true,
                data: activitylist
            });
            activitylist.remove();
        }
    })
})

//Adds tracked activity for a day by ID and responds with success or failure
router.post('/:id/stats', function (req, res) {
    let id = req.params.id,
        timestamp = req.body.timestamp,
        newactivity = JSON.parse(req.body.activity);
    //Day's activity passed as a JSON object with count and timestamp
    /* Ex: { count: 8, timestamp: '2017-07-11T15:01:51.015Z' } */

    if (!(newactivity)) {
        res.json({
            success: false,
            message: "Not all required fields were provided."
        });
    } else {

        //Find activity list given ID
        ActivityList.findOne({
            _id: id,
            owner_id: req.decoded['$__']['_id']
        }, function (err, activitylist) {
            if (err) res.json({
                success: false,
                message: "Error finding activitylist by ID."
            });

            else if (!activitylist) res.json({
                success: false,
                message: "Could not find activity list by given ID."
            });

            else if (activitylist) {

                console.log("Got activity_ids list:");
                console.dir(activitylist['_doc']['activity_ids']);
                //Split comma delimited activity id list into array, if there's more than one
                let oldactivityids = activitylist['_doc']['activity_ids'];
                let activity_ids =
                    oldactivityids.includes(",") ? oldactivityids.split(",") : [oldactivityids];

                if (activity_ids[0] == '') activity_ids = [];

                console.log("Parsed activity_ids array:");
                console.dir(activity_ids);
                console.dir(newactivity);

                let newactitem = new Activity({
                    count: parseInt(newactivity['count']),
                    timestamp: new Date(newactivity['timestamp'].toString())
                });

                newactitem.save(function (err) {

                    console.log("New activity item saved:");
                    console.dir(newactitem);

                    if (err) res.json({
                        success: false,
                        message: "Error saving day's activity to DB"
                    });

                    //If this isn't the first insertion
                    else if (activity_ids.length > 0) {
                        //See if any other activities share the same timestamp and delete if so
                        Activity.find({
                            _id: {
                                "$in": activity_ids
                            }
                        }, function (err, activities) {
                            if (err) res.json({
                                success: false,
                                message: "Error finding activities by id."
                            });

                            else if (activities) {
                                for (var i = 0; i < activities.length; i++) {
                                    let act_time = new Date(activities[i].timestamp),
                                        new_time = new Date(newactitem.timestamp);

                                    console.log(`Comparing timestamps - oldtime: ${activities[i].timestamp} newtime: ${newactitem.timestamp}`);

                                    //This won't continue to work 100% through the year 3000, but that's a risk I'm willing to take
                                    if ((act_time.getDay() + act_time.getMonth() + act_time.getYear()) == (new_time.getDay() + new_time.getMonth() + new_time.getYear())) {
                                        console.log("Overwriting same day's activity")
                                        console.dir(activity_ids);
                                        activity_ids.splice(i, 1);
                                        activities[i].remove();
                                        console.dir(activity_ids);
                                        //Update parent's activity_ids list
                                        activity_ids.push(newactitem.id);
                                        activitylist.activity_ids = activity_ids;
                                        activitylist.save(function (err) {
                                            if (err) res.json({
                                                success: false,
                                                message: "Error saving activityIDs to list."
                                            });
                                            else res.json({
                                                success: true,
                                                data: activitylist
                                            });

                                        });
                                        break;
                                    }
                                }
                            }
                        });

                    } else {
                        //Update parent's activity_ids list
                        activity_ids.push(newactitem.id);
                        activitylist.activity_ids = activity_ids;
                        activitylist.save(function (err) {
                            if (err) res.json({
                                success: false,
                                message: "Error saving activityIDs to list."
                            });
                            else res.json({
                                success: true,
                                data: activitylist
                            });

                        });
                    }


                });

            }
        });
    }
})

module.exports = router;