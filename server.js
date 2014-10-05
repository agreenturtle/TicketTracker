var express = require("express");
var mustacheExpress = require("mustache-express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");
var mysql = require("mysql2");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var passport = require("passport");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");

var models = require("./models");

var app = express();

app.engine("mustache", mustacheExpress());

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");

//app.set("script", __dirname + "/scripts");
app.set("view engine","mustache");

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());

//app.use for creating a session
app.use(cookieParser());
app.use(expressSession({secret: "TICKET_TRACKER_SECRET"}));

var TEST = true;
if(TEST)
{
	var GOOGLE_CLIENT_ID = process.env.TICKET_TRACKER_LOCAL_CLIENT_ID;
	var GOOGLE_CLIENT_SECRET = process.env.TICKET_TRACKER_LOCAL_CLIENT_SECRET;
	var GOOGLE_CALLBACK = "http://localhost:3000/oauth2callback";
}
else
{
	var GOOGLE_CLIENT_ID = process.env.TICKET_TRACKER_HEROKU_CLIENT_ID;
	var GOOGLE_CLIENT_SECRET = process.env.TICKET_TRACKER_HEROKU_CLIENT_SECRET;
	var GOOGLE_CALLBACK = "http://secure-scrubland-4576.herokuapp.com/oauth2callback";
}

var WHITE_LIST = ["james@thrivesmart.com"];

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: GOOGLE_CALLBACK
	},
	function(accessToken, refreshToken, profile, done) {
		//only allow certain people to view the database
		for(var i = 0; i < WHITE_LIST.length; i++){
			if(profile._json.email == WHITE_LIST[i]){
				//console.log(profile._json.email);
				return done(null, profile);
			}
		}
		return done();
	}
));

app.get('/auth/google', passport.authenticate('google',{scope: ' https://www.googleapis.com/auth/userinfo.email '}));

app.get('/oauth2callback', passport.authenticate('google', { failureRedirect: '/invalid-email' }),
	function(req, res) {
		//set up session
		req.session.name = 'admin';
		res.redirect('/index');
});

app.get("/", function(req, res){
	res.render("application", null);
});

app.get("/invalid-email",function(req,res){
	res.render('invalid-email');
});

app.get("/index", function(req, res){
	if(req.session.name == "admin"){
		res.render("index", null);
	}
	else{
		res.render("invalid-email", null);
	}
});

app.listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
