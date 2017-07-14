const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    count: Number,
    timestamp: Date
});

module.exports = mongoose.model("Activity", ActivitySchema);