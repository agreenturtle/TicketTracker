var express = require("express");
var mustacheExpress = require("mustache-express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");
var mysql = require("mysql2");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var passport = require("passport");

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

var GOOGLE_CLIENT_ID = process.env.USERHUB_GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.USERHUB_GOOGLE_CLIENT_SECRET;
var GOOGLE_CALLBACK = "http://userhub.herokuapp.com/oauth2callback";

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
		if(profile._json.email == WHITE_LIST[0] || profile._json.email == WHITE_LIST[1] || profile._json.email == WHITE_LIST[2]){
			//console.log(profile._json.email);
			return done(null, profile);
		}
		else{
			return done();
		}
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
	res.render("index", null);
});

app.listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
