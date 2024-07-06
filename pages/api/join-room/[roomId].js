import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const {
    query: { roomId },
  } = req;

  if (req.method === 'POST') {
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ success: false, message: 'Player name is required' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      // Check if the room exists
      const room = await roomsCollection.findOne({ roomId });

      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }

      // Add the player to the room
      await roomsCollection.updateOne(
        { roomId },
        { $addToSet: { players: playerName } } // Add player if not already in the array
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to join the room' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
