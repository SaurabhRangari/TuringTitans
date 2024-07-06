// lib/mongodb.js
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the MongoClient instance across module reloads caused by HMR.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(() => {
      console.log('MongoDB connected');
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new MongoClient instance for each connection request.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(() => {
    console.log('MongoDB connected');
    return client;
  });
}

// Export the module-scoped MongoClient promise.
export default clientPromise;
