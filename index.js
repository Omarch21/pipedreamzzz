/*const express = require('express')
app = express()

var url = require('url');
var dt = require('./date-time');

const port = process.env.PORT || 3000
const majorVersion = 1
const minorVersion = 2

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))

// The app.get functions below are being processed in Node.js running on the server.
// Implement a custom About page.
app.get('/about', (request, response) => {
	console.log('Calling "/about" on the Node.js server.')
	response.type('text/plain')
	response.send('About Node.js on Azure Template.')
})

app.get('/version', (request, response) => {
	console.log('Calling "/version" on the Node.js server.')
	response.type('text/plain')
	response.send('Version: '+majorVersion+'.'+minorVersion)
})

// Return the value of 2 plus 2.
app.get('/2plus2', (request, response) => {
	console.log('Calling "/2plus2" on the Node.js server.')
	response.type('text/plain')
	response.send('4')
})

// Add x and y which are both passed in on the URL. 
app.get('/add-two-integers', (request, response) => {
	console.log('Calling "/add-two-integers" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	let x = parseInt(inputs.x)
	let y = parseInt(inputs.y)
	let sum = x + y
	response.type('text/plain')
	response.send(sum.toString())
})

// Template for calculating BMI using height in feet/inches and weight in pounds.
app.get('/calculate-bmi', (request, response) => {
	console.log('Calling "/calculate-bmi" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	const heightFeet = parseInt(inputs.feet)
	const heightInches = parseInt(inputs.inches)
	const weight = parseInt(inputs.lbs)

	console.log('Height:' + heightFeet + '\'' + heightInches + '\"')
	console.log('Weight:' + weight + ' lbs.')

	// Todo: Implement unit conversions and BMI calculations.
	// Todo: Return BMI instead of Todo message.

	response.type('text/plain')
	response.send('Todo: Implement "/calculate-bmi"')
})

// Test a variety of functions.
app.get('/test', (request, response) => {
    // Write the request to the log. 
    console.log(request);

    // Return HTML.
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<h3>Testing Function</h3>')

    // Access function from a separate JavaScript module.
    response.write("The date and time are currently: " + dt.myDateTime() + "<br><br>");

    // Show the full url from the request. 
    response.write("req.url="+request.url+"<br><br>");

    // Suggest adding something tl the url so that we can parse it. 
    response.write("Consider adding '/test?year=2017&month=July' to the URL.<br><br>");
    
	// Parse the query string for values that are being passed on the URL.
	var q = url.parse(request.url, true).query;
    var txt = q.year + " " + q.month;
    response.write("txt="+txt);

    // Close the response
    response.end('<h3>The End.</h3>');
})

// Return Batman as JSON.
var spiderMan = {
	"firstName":"Bruce",
	"lastName":"Wayne",
	"preferredName":"Batman",
	"email":"darkknight@lewisu.edu",
	"phoneNumber":"800-bat-mann",
	"city":"Gotham",
	"state":"NJ",
	"zip":"07101",
	"lat":"40.73",
	"lng":"-74.17",
	"favoriteHobby":"Flying",
	"class":"cpsc-24700-001",
	"room":"AS-104-A",
	"startTime":"2 PM CT",
	"seatNumber":"",
	"inPerson":[
		"Monday",
		"Wednesday"
	],
	"virtual":[
		"Friday"
	]
}

app.get('/batman', (request, response) => {
	console.log('Calling "/batman" on the Node.js server.')
	response.type('application/json')
	response.send(JSON.stringify(spiderMan, null, 4))
})

// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
*/
const express			= require('express');
const session			= require('express-session');
const hbs				= require('express-handlebars');
const mongoose			= require('mongoose');
const passport			= require('passport');
const localStrategy		= require('passport-local').Strategy;
const bcrypt			= require('bcrypt');
const app				= express();
const bodyparser        = require('body-parser');
var fs = require('fs');
const User = require(__dirname+'/models/user');
if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config()
}
const req = require('express/lib/request');
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// Middleware
app.use(bodyparser.urlencoded({ extended: true}))
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy(function (username, password, done) {
	User.findOne({ username: username }, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });

		bcrypt.compare(password, user.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, { message: 'Incorrect password.' });
			
			return done(null, user);
		});
	});
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}
// ROUTES
app.get('/', isLoggedOut, (req, res) => {
	res.render("home", { title: "Home" });
});
User.findOne({username: 'a'},(err,data)=> console.log(data));
User.findOneAndUpdate({username : 'a'},(err,data)=> {$inc : {gamesplayed : 1}});
/*app.get('/about', (req, res) => {
	res.render("index", { title: "About" });
});
*/
app.get('/about', isLoggedIn, (req, res) => {
	res.send('about');
});
app.get('/home', isLoggedIn, (req, res) => {
	
	res.send('hi' + req.user.username + ' ' +req.user.gamesplayed + ' ' + req.user._id + ' ' + User.findOne({username: "a"}) + ' ' + User.findOne({gamesplayed: req.user.gamesplayed},(err,data)=> (data)));
	User.updateOne({username: req.user.username}, {$inc:{gamesplayed:1}}, (err) => {
		if (err) {
			console.log("Something wrong when updating data!");
		}
	});
});
app.post('home', isLoggedIn, (req, res) => {
	findOneAndUpdate({username :res.user.username}, {$inc : {gamesplayed : 1}});
});


app.get('/login', isLoggedOut, (req, res) => {
	const response = {
		title: "Login",
		error: req.query.error
	}

	res.render('login', response);
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/about',
	failureRedirect: '/login?error=true'
}));

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

// Setup our admin user
app.get('/register', (req,res) =>{
    fs.readFile(__dirname + '/views/register.hbs/', function(err, data){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    })
  })
app.post('/register/done', async (req, res) => {
		const exists = await User.exists({ username: req.body.email });
	
		if (exists) {
			res.send('Account email is already taken');
			return;
		};
	
		bcrypt.genSalt(10, function (err, salt) {
			if (err) return next(err);
			bcrypt.hash(req.body.password, salt, function (err, hash) {
				if (err) return next(err);
				
				const newAdmin = new User({
					username: req.body.email,
					password: hash,
				});
	
				newAdmin.save();
				
				res.redirect('/login');
			});
		});
	});


app.listen(3000, () => {
	console.log("Listening on port 3000");
});
