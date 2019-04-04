var mongoose = require("mongoose");
//Schema Setup
var followerSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    followed: Date
});

module.exports = mongoose.model("Follower", followerSchema);