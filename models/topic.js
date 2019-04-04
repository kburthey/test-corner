var mongoose = require("mongoose");
//Schema setup
var topicSchema = new mongoose.Schema({
    title: String, 
    description: String,
    likes_count: Number,
    category: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
module.exports = mongoose.model("Topic", topicSchema);