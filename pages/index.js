import { useState } from 'react';
import { useRouter } from 'next/router';
import questions from "../config/fastestFingerFirst.json";

const Lobby = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  const [players, setPlayers] = useState([]); // State to store players in the room


  // Function to generate 10 random indexes based on the length of questions array
  const generateRandomIndexes = () => {
    const numberOfQuestions = questions.length; // Assuming questions is your JSON array
    const randomIndexes = [];
    while (randomIndexes.length < 10) {
      const randomIndex = Math.floor(Math.random() * numberOfQuestions);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }
    return randomIndexes;
  };

  const createRoom = async () => {
    if (!playerName) {
      alert("Please enter your name");
      return;
    }
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playerName, questionIndexes: generateRandomIndexes() })
    });
    const data = await res.json();
    router.push(`/room/${data.roomId}?playerName=${playerName}`);
  };

  // Function to handle joining the room
  const joinRoom = async () => {
    if (!playerName) {
      alert("Please enter your name");
      return;
    }
  
    try {
      const res = await fetch(`/api/join-room/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName })
      });
  
      const data = await res.json();
  
      if (data.success) {
        // Update players state with the new player
        setPlayers([...players, playerName]);
        router.push(`/room/${roomId}?playerName=${playerName}`);
      } else {
        alert(data.message || "Failed to join the room");
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join the room. Please try again.');
    }
  };

  return (
    <div>
      <h1>Kaun Banega Crorepati Lobby </h1>
      <input 
        type="text" 
        placeholder="Enter your name" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)} 
      />
      <button onClick={createRoom}>Create Room</button>
      <br/>
      <input 
        type="text" 
        placeholder="Enter Room ID" 
        value={roomId} 
        onChange={(e) => setRoomId(e.target.value)} 
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default Lobby;
