const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine','ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'developer', password: 'developer'},
	{name: 'guest', password: 'guest'}
);

const Admins = new Array(
	{name: 'admin', password: 'admin'},
	{name: 'mod', password: 'mod'}
);

app.set('view engine','ejs');

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY]
}));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    // user not logged in!
		res.redirect('/login');
	} else if (req.session.role == 'Teacher'){
		res.status(200).render('teacher',{name:req.session.username, role: req.session.role});
	} else {
		res.status(200).render('welcometest',{name:req.session.username, role: req.session.role});
	}
});

app.get('/login', (req,res) => {
	res.status(200).render('login',{});
});

app.post('/login', (req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {
			// correct user name + password
			// store the following name/value pairs in cookie session
			req.session.authenticated = true;        // 'authenticated': true
			req.session.username = req.body.name;	 // 'username': req.body.name
			req.session.role = 'Student';		
		}		
	});
	Admins.forEach((Admins) => {
		if (Admins.name == req.body.name && Admins.password == req.body.password) {
			//console.log("Admin Detected");
			req.session.authenticated = true;        // 'authenticated': true
			req.session.username = req.body.name;
			req.session.role = 'Teacher';
		}
	});
	
	res.redirect('/');
});

app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});

app.listen(process.env.PORT || 8099);
