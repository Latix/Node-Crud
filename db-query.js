const { MongoClient } = require('mongodb');
const dotenv = require("dotenv");

dotenv.config();

// Database Name
const dbName = 'Crud-App';

// Collection Name
const collectionName = 'interactions';

// Sample data to insert
const data = [
    { user: '666943b7c7d83be4931e5ce9', product: '66693fee388ea460a4f1920b', rating: 2 },
  ];

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to server');

    // Connect to the database
    const db = client.db(dbName);

    // Get the collection
    const collection = db.collection(collectionName);

    // Insert many documents
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    // Close the client
    await client.close();
  }
}

run().catch(console.dir);
