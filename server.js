var express = require("express");
var mustacheExpress = require("mustache-express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");
var mysql = require("mysql2");

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

app.get("/",function(req, res){
	res.render("application",null);
})

app.listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
