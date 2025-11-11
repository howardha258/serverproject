const { MongoClient, ServerApiVersion } = require("mongodb");
const http = require('http');const url = require('url');
const qs = require ('querystring');const fs = require('fs');
const port = 8099;
 
const uri = "mongodb+srv://howardha258:yolo12948@cluster0.plrk1tf.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);
const dbName = 'AccountList';
const collectionName = "list";


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
var registermode = false;

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
        if (registermode) {
            res.redirect('/register');
        } else {
            res.redirect('/login');
        }
    } else if (req.session.role == 'Teacher'){
        res.status(200).render('teacher',{name:req.session.username, role: req.session.role});
    } else {
        res.status(200).render('student',{name:req.session.username, role: req.session.role});
    }
});

app.get('/login', (req,res) => {
    res.status(200).render('login',{});
});

app.post('/login', (req,res) => {
if (registermode) {
    registermode = false;
    res.redirect('/');
} else {
    users.forEach((user) => {
        if (user.name == req.body.name && user.password == req.body.password) {
            // correct user name + password
            // store the following name/value pairs in cookie session
            req.session.authenticated = true;        // 'authenticated': true
            req.session.username = req.body.name;     // 'username': req.body.name
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
}
});

app.get('/logout', (req,res) => {
    req.session = null;   // clear cookie-session
    res.redirect('/');
});

app.get('/registration', (req, res) => {
    registermode = true;
    res.status(200).render('registration', {});
});

app.post('/registration', async (req, res) => {
    res.redirect('/register');
});


app.get('/register', (req, res) => {
    //registermode = true;
    res.status(200).render('register', {});
});

app.post('/register', async (req, res) => {    // place insert mongodb here
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection(collectionName);
    await usersCollection.insertOne({"username":req.body.name, "password":req.body.password});

    res.redirect('/login');
    await client.close();
});

app.listen(process.env.PORT || 8099);
