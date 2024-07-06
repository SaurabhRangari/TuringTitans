// pages/api/add-player.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roomId, playerName } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      await roomsCollection.updateOne(
        { roomId },
        { $addToSet: { players: playerName } } // $addToSet ensures no duplicates
      );

      res.status(200).json({ message: 'Player added' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
