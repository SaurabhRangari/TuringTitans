// pages/api/room/[roomId].js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { roomId } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('kbc');
    const roomsCollection = db.collection('rooms');

    const room = await roomsCollection.findOne({ roomId });

    if (room) {
      room._id = room._id.toString(); // Convert _id to string
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
