// pages/api/get-results.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { roomId } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const resultsCollection = db.collection('results');

      const results = await resultsCollection.find({ roomId }).toArray();

      res.status(200).json({ results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
