var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var app = express();


process.env.NODE_ENV = 'development';

var signup = require('./routes/signup.js');
var profile = require('./routes/profile.js');

 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res)
{
	res.render('index.jade');
})

app.post('/signup',signup.signUp);
app.post('/signin',signup.signIn);
app.post('/add_post',profile.addPost);
app.post('/add_comment',profile.addComment);


var server = http.createServer(app).listen(8000, function () {

    console.log("Express server listening on port 8000");

});