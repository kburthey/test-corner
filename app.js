//Test App (based on Yelp Camp v6)
var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    //cookee          = require("cookie-session"),
    //helmet          = require("helmet"),
    User            = require("./models/user"),
    Comment         = require("./models/comments"),
    Topic           = require("./models/topic"),
    server          = require("http").Server(app),
    io              = require("socket.io")(server);
    
var indexRoutes     = require("./routes/index"),
    topicRoutes     = require("./routes/topics"),
    commentRoutes   = require("./routes/comments"),
    profileRoutes   = require("./routes/profile");
    
var url = process.env.DATABASEURL || "mongodb://localhost/test_corner_v2";
//mongoose.connect("mongodb://localhost/test_corner");
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//passport configuration
//production version needs cookie-session
app.use(require("express-session")({
    secret: "Durham",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

io.on("connection", function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

app.use(function(req, res, next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(topicRoutes);
app.use(commentRoutes);
app.use(profileRoutes);

var port = process.env.PORT || 1337;
server.listen(port, function(){
//server.listen(1337, function(){
    console.log("PPV server started");
});