const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivityListSchema = new Schema({
    owner_id: String,
    title: String,
    description: String,
    column_title: String,
    activity_ids: String,
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("ActivityList", ActivityListSchema);