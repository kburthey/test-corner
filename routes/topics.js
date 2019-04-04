var express     = require("express"),
    router      = express.Router(),
    Topic       = require("../models/topic"),
    AccessToken = require("twilio").jwt.AccessToken,
    VideoGrant  = AccessToken.VideoGrant,
    middleware  = require("../middleware"),
    Pusher      = require('pusher'),
    pusher      = new Pusher({
        appId: '550886',
        key: 'aadf45a66a5f71fd6afc',
        secret: '9b7698fe573f9e21652b',
        cluster: 'us2',
        encrypted: true
    });

    var ACCOUNT_SID = 'ACda5fcf4898c7060f7b0d4900b9ea6609';
    var API_KEY_SECRET = 'W4JD2315ykBqFlQicOdyZV11brHPV6D3';
    var API_KEY_SID = 'SK40efdd58fc1dc4722bddd7f81bab56d5';

//INDEX - show all topics
router.get("/corner", function(req, res){
    //Get all topics from DB
    Topic.find({}, function(err, topics){
        if(err){
            console.log(err);
        } else {
            Topic.find().sort({'likes_count': 1}).exec(function(err, filteredTopic){
            //Topic.find({}, {"sort" : [['likes_count', 'desc']]}, function(err, filteredTopic){
                if(err){
                    console.log(err);
                } else {
                    res.render("topics/index", {topics: topics, fopic: filteredTopic});
                }
            });
        }
    });
});

//new - show form to create new topic
router.get("/corner/new", middleware.isLoggedIn, function(req, res){
    res.render("topics/new");
});

//Create - add new topic to DB
router.post("/corner", middleware.isLoggedIn, function(req, res){
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newTopic = req.body.topic;
    newTopic.author = author;
    newTopic.likes_count = 0;
    Topic.create(newTopic, function(err, newTopic){
        if(err){
            console.log(err);
        } else {
            res.redirect("/corner");
        }
    });
});

//SHOW - shows topic page
router.get("/corner/:id", function(req, res){
    Topic.find({}, function(err, topics){
        if(err){
            console.log(err);
        } else {
            Topic.findById(req.params.id).populate("comments").exec(function(err, foundTopic){
                if(err || !foundTopic){
                    console.log(err);
                    req.flash("error", "Topic not found");
                    res.redirect("back");
                } else {
                    res.render("topics/show", {topic: foundTopic, allTopics: topics});
                }
            });
        }
    });
});

//Edit Topic Route
router.get("/corner/:id/edit", middleware.checkTopicOwnership, function(req, res){
    Topic.findById(req.params.id, function(err, foundTopic){
        if(err){
            res.redirect("/corner");
        } else {
            res.render("topics/edit", {topic: foundTopic});
        }
    });
});

//Update Route
router.put("/corner/:id", middleware.checkTopicOwnership, function(req, res){
    Topic.findByIdAndUpdate(req.params.id, req.body.topic, function(err, updatedTopic){
        if(err){
            res.redirect("/corner/" + req.params.id + "/edit");
        } else {
            res.redirect("/corner/" + req.params.id);
        }
    });
});

//Destroy Topic Route
router.delete("/corner/:id", middleware.checkTopicOwnership, function(req, res){
    Topic.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/");
        } else {
            res.redirect("/corner");
            //might be a good idea to add a flash message here confirming delete
        }
    });
});

//create token for user access in twilio
router.get('/token', middleware.isLoggedIn, function(req, res){
    var identity = req.user.username;
    //create an acces token which we will sign and return to client
    //containing the grant we just created
    var token = new AccessToken(
        ACCOUNT_SID,
        API_KEY_SID,
        API_KEY_SECRET
    );
    //assign the generated identity to the token
    token.identity = identity;

    //grant the access token twilio video capabilities
    var grant = new VideoGrant();
    token.addGrant(grant);

    //serialize the token to a jwt string and include it in a Json response
    res.send({
        identity: identity,
        token: token.toJwt()
    });
});

router.post('/corner/:id/act', function(req, res, next){
    const action = req.body.action;
    const counter = action === 'Like' ? -1 : 1;
    Topic.findByIdAndUpdate({_id: req.params.id}, {$inc: {likes_count: counter}}, {}, function(err, numberAffected){
        if(err){
            console.log(err);
        } else {
            pusher.trigger('post-events', 'postAction', {action: action, postId: req.params.id}, req.body.socketId);
            res.send('');
        }
        
    });
});
module.exports = router;