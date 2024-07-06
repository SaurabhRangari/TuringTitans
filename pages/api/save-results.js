// pages/api/save-results.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roomId, playerName, totalTime, rightAnswers } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const resultsCollection = db.collection('results');

      await resultsCollection.updateOne(
        { roomId, playerName },
        { $set: { totalTime, rightAnswers } },
        { upsert: true }
      );

      res.status(200).json({ message: 'Results saved' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
