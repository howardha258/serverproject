const { MongoClient } = require("mongodb");
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const port = 8099;

const uri = "mongodb+srv://howardha258:yolo12948@cluster0.plrk1tf.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);
const dbName = 'AccountList';
const collectionName = "list";

const SECRETKEY = 'I want to pass COMPS381F';
const Admins = [
    { name: 'admin', password: 'admin' },
    { name: 'mod', password: 'mod' }
];

let registermode = false;

app.set('view engine', 'ejs');
app.use(session({ name: 'loginSession', keys: [SECRETKEY] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    if (!req.session.authenticated) {
        if (registermode) {
            return res.redirect('/register');
        } else {
            return res.redirect('/login');
        }
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection(collectionName);

        if (req.session.role == 'Teacher') {
            const students = await usersCollection.find({}).toArray(); 
            return res.status(200).render('teacher', { name: req.session.username, role: req.session.role, students });
        } else {
            return res.status(200).render('student', { name: req.session.username, role: req.session.role });
        }
    } catch (error) {
        console.error("An error occurred while retrieving data:", error);
        return res.status(500).send("Internal server error");
    } finally {
        await client.close();
    }
});




app.get('/login', (req, res) => {
    const errorMessage = req.query.error || '';
    res.status(200).render('login', { errorMessage }); 
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection(collectionName);

        const user = await usersCollection.findOne({ username: name });
        const admin = Admins.find((admin) => admin.name === name);
        
        if (user && user.password === password) {
            req.session.authenticated = true;
            req.session.username = user.username;
            req.session.role = "Student";
            return res.redirect("/");
        } 
        if (admin && admin.password === password) {
            req.session.authenticated = true;
            req.session.username = admin.name;
            req.session.role = "Teacher";

            const students = await usersCollection.find({}).toArray(); 
            res.render("teacher", { name: admin.name, students }); 
            return;
        }
        return res.redirect('/login?error=User does not exist or password is incorrect.');
    } catch (error) {
        console.error("An error occurred while logging in:", error);
        res.status(500).send("Internal server error");
    } finally {
        await client.close();
    }
});


app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/registration', (req, res) => {
    registermode = true;
    res.status(200).render('registration', {});
});

app.post('/registration', async (req, res) => {
    res.redirect('/register');
});

app.get('/backtologin', (req, res) => {
    registermode = false;
    res.status(200).render('backtologin', {});
});

app.post('/backtologin', async (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    const errorMessage = req.query.error || ''; 
    res.status(200).render('register', { errorMessage }); 
});

app.post('/register', async (req, res) => {
    const { fname, name, password, gender, role } = req.body;

    if (!name || !password) {
        return res.redirect('/register?error=Username and password cannot be empty.'); 
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection(collectionName);
  
        const existingUser = await usersCollection.findOne({ username: name });
        if (existingUser) {
            return res.redirect('/register?error=User already exists.'); 
        }

        await usersCollection.insertOne({ fullname: fname, username: name, password: password, gender: gender, role: role});
        res.redirect('/login'); 
    } catch (error) {
        console.error("An error occurred during registration:", error);
        res.status(500).send("Internal server error.");
    } finally {
        await client.close();
    }
});

app.get('/studentdata/:username', async (req, res) => {
    if (!req.session.authenticated || req.session.role !== 'Teacher') {
        return res.redirect('/login?error=Please log in to your teacher account first.');
    }

    const { username } = req.params;

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection(collectionName);

        const studentData = await usersCollection.findOne({ username: username }); 
        if (studentData) {
            res.status(200).render('studentdata', { student: studentData }); 
        } else {
            res.status(404).send("Student not found.");
        }
    } catch (error) {
        console.error("An error occurred while retrieving student data:", error);
        res.status(500).send("Internal server error.");
    } finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


