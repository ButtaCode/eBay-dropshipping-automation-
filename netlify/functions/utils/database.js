const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('dropship_automation');
    cachedDb = db;
    
    await initializeCollections(db);
    
    return db;
  } catch (error) {
    throw error;
  }
}

async function initializeCollections(db) {
  const collections = ['users', 'products', 'orders', 'automation', 'listings', 'profits'];
  
  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      await collection.insertOne({ _init: true });
      await collection.deleteOne({ _init: true });
    } catch (error) {
      // Collection exists
    }
  }
}

module.exports = { connectToDatabase };
