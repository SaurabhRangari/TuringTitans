import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Room = ({ roomId, playerName }) => {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10); // Initial countdown time in seconds
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      const res = await fetch(`/api/room/${roomId}`);
      const data = await res.json();
      setPlayers(data.players || []);
      setIsCreator(data.creator === playerName); // Check if current player is the creator
    //   setShowCountdown(data.gameStarted === false && data.creator === playerName); // Show countdown only for creator
      setGameStarted(data.gameStarted); // Update game start status
    };

    fetchRoomData();

    const interval = setInterval(fetchRoomData, 2000);
    return () => clearInterval(interval);
  }, [roomId, playerName]);

  const startGame = async () => {
    // Notify backend to start the game
    await fetch('/api/start-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId })
    });

    // Redirect to the game page with playerName
    router.push(`/fastest-finger-first/${roomId}?playerName=${playerName}`);
  };

  const leaveRoom = async () => {
    // Notify backend that the player is leaving the room
    await fetch('/api/leave-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId, playerName })
    });

    // Redirect to the lobby
    router.push('/');
  };

  // Function to start countdown when showCountdown is true
  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      // Start the game when countdown reaches 0
      startGame();
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown, startGame]);

  // Automatically start game for joined players
  useEffect(() => {
    if (gameStarted && !isCreator) {
      startGame();
    }
  }, [gameStarted, isCreator]);

  return (
    <div>
      <h1>Room {roomId}</h1>
      <h2>Players</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      {isCreator && players.length > 0 && !showCountdown && (
        <button onClick={() => setShowCountdown(true)}>Start Game</button>
      )}
      {showCountdown && (
        <div>
          <p>Game starting in {countdown} seconds...</p>
        </div>
      )}
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { roomId, playerName } = context.query;

  return {
    props: {
      roomId,
      playerName
    },
  };
}

export default Room;
