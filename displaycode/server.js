// app.js
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection details
const uri = 'mongodb://localhost:27017'; // Replace with your connection string
const dbName = 'yourDatabaseName';
const collectionName = 'yourCollectionName';

app.get('/', async (req, res) => {
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all documents from the collection
    const data = await collection.find({}).toArray();
    
    // Render the EJS template and pass the fetched data to it
    res.render('index', { items: data });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.listen(port, () => {
  console.log(Server running at http://localhost:${port});
});
