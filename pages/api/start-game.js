import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roomId } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('kbc');
      const roomsCollection = db.collection('rooms');

      // Update room to mark game started
      await roomsCollection.updateOne(
        { roomId },
        { $set: { gameStarted: true } }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to start game' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
