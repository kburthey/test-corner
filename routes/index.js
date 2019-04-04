var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user");

//index
router.get("/", function(req, res){
    res.render("landing");
});

//Authorization 
//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle signup logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Kyle's Corner");
            res.redirect("/corner")
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/corner",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout",function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/corner");
});

module.exports = router;