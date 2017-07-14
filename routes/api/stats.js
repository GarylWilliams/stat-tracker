const Activity = require('../../models/activity');
const ActivityList = require('../../models/activitylist');
const User = require('../../models/user');
const express = require('express');
const router = express.Router();


//Routes for /api/stats

router.delete('/stats/:id', function(req, res) {
    let id = req.params.id;
    
    Activity.findOne({
        _id: id
    }, function(err, activity) {
        if(err) res.json({success: false, message: "Error finding activity by ID."});
        
        else if(!activity) res.json({success: false, message: "Could not find activity by given ID."});
        
        else if(activity) {
            res.json({success: true, data: activity});
            activity.remove();
        }
    });
})

module.exports = router;
