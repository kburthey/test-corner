var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Topic       = require("../models/topic"),
    Comment     = require("../models/comments"),
    middleware  = require("../middleware");

// ==============================================
//Comments Routes 
// ==============================================
//new comment
router.get("/corner/:id/comments/new", middleware.isLoggedIn, function(req, res){
    //find topics by id
    Topic.findById(req.params.id, function(err, topic){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {topic: topic});
        }
    });
});
//create comment
router.post("/corner/:id/comments", middleware.isLoggedIn, function(req, res){
    Topic.findById(req.params.id, function(err, topic){
        if(err){
            console.log(err);
            res.redirect("/corner");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Oops, something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    topic.comments.push(comment._id);
                    topic.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/corner/" + topic._id);
                }
            });
        }
    });
});

//edit comment
router.get("/corner/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Topic.findById(req.params.id, function(err, foundTopic){
        if(err || !foundTopic){
            req.flash("error", "Cannot find that topic");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {topic_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//Comments update
router.put("/corner/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/corner/" + req.params.id);
        }
    });
});

//comments Destroy
router.delete("/corner/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/corner/" + req.params.id);
        }
    });
});

module.exports = router;