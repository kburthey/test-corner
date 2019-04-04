var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
//User Schema
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    info: String,
    location: String,
    joined: Date, 
    like_count: Number, 
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Follower"
    }]
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);