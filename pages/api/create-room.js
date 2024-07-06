import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { playerName, questionIndexes } = req.body;

    try {
      console.log('Connecting to MongoDB...');
      const client = await clientPromise;
      console.log('Connected to MongoDB');
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      const roomId = Math.random().toString(36).substr(2, 5);
      console.log(`Generated roomId: ${roomId}`);

      const result = await roomsCollection.insertOne({
        roomId,
        players: [playerName],
        creator: playerName,
        gameStarted: false,
        questionIndexes: questionIndexes,
      });

      console.log('Room created:', result);
      res.status(201).json({ roomId });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Failed to create room' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
