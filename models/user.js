const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    api_key: String,
    activity_listids: String,
    createdAt: Date,
});

module.exports = mongoose.model("User", UserSchema);