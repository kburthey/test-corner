var express     = require("express"),
    router      = express.Router(),
    User        = require("../models/user"),
    middleware  = require("../middleware"),
    Follower    = require("../models/follower");
//Profile routes
router.get("/profile/:id", middleware.isLoggedIn, function(req, res){
    User.find({}, function(err, allusers){
        if(err){
            console.log(err);
        } else {
            User.findById(req.params.id).populate("followers").exec(function(err, user){
                if(err){
                    console.log(err);
                } else {
                    res.render("profile", {user: user, allusers: allusers});
                    console.log(user);      
                }
            });
        }
    })
});

//router.get("/profile/:id", function(req, res){
//    res.send("view user's profile");
//});
//EDIT Profile
router.get("/profile/:id/edit", function(req, res){
    User.find({}, function(err, allusers){
        if(err){
            console.log(err);
        } else {
            User.findById(res.locals.currentUser._id, function(err, user){
                if(err){
                    console.log(err);
                } else {
                    res.render("profile/edit", {user:user, allusers: allusers});
                }
            });
        }
    });
});
//Update profile
router.put("/profile/:id/", middleware.checkProfileOwnership, function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedProfile){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/profile/" + req.params.id);
        }
    });
});

//Destroy Profile
router.delete("/profile/:id", middleware.checkProfileOwnership, function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Profile Deleted");
            req.redirect("/corner/")
        }
    });
});

//create follower
router.post("/profile/:id/follow", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            Follower.create(req.body.follower, function(err, follower){
                if(err){
                    req.flash("error", "Unable to follow user at this time");
                    console.log(err);
                } else {
                    follower.user.id = req.user._id;
                    follower.user.username = req.user.username;
                    follower.save();
                    user.followers.push(follower._id);
                    user.save();
                    req.flash("success", "Follow successful");
                    res.redirect("/profile/" + req.params.id);
                }
            });
        }
    });
});

router.post("/profile/:id/like", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            User.findByIdAndUpdate({_id: req.params.id}, {$inc: {like_count: 1}}, {}, function(err, userLike){
                if(err){
                    console.log(err);
                } else {
                    res.redirect("/profile/" + req.params.id);
                }
            });
        }
    });
});

module.exports = router;