const rooms = {};

export const createRoom = (roomId, playerName) => {
  if (!rooms[roomId]) {
    rooms[roomId] = { players: [] };
  }
  rooms[roomId].players.push(playerName);
  return rooms[roomId];
};

export const getRoom = (roomId) => {
  return rooms[roomId] || null;
};
