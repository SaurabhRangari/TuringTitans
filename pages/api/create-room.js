import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { playerName, questionIndexes } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      // Generate a random roomId (you may have your own logic for generating it)
      const roomId = Math.random().toString(36).substr(2, 5);

      // Store the room with creator information and provided questionIndexes
      const result = await roomsCollection.insertOne({
        roomId,
        players: [playerName],
        creator: playerName,
        gameStarted: false,
        questionIndexes: questionIndexes, // Use provided questionIndexes
      });

      res.status(201).json({ roomId });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Failed to create room' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
