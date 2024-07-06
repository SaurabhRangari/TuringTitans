import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { roomId } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      const room = await roomsCollection.findOne({ roomId });

      if (!room || !room.players || room.players.length === 0) {
        return res.status(404).json({ message: 'Room not found or no players' });
      }

      const allPlayersFinished = room.players.every(player => room.results && room.results[player]);

      res.status(200).json({ allPlayersFinished });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to check results' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
