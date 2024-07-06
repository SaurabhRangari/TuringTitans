import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import questions from "../../config/fastestFingerFirst.json";
import clientPromise from "../../lib/mongodb";

const FastestFingerFirst = ({ initialQuestions, roomId, playerName }) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalTime, setTotalTime] = useState(0);
  const [rightAnswers, setRightAnswers] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [allPlayersFinished, setAllPlayersFinished] = useState(false); // Track if all players have finished

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleNextQuestion();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const checkResults = async () => {
      const res = await fetch(`/api/check-results?roomId=${roomId}`);
      const data = await res.json();
      setAllPlayersFinished(data.allPlayersFinished); // Update allPlayersFinished state
      if (data.allPlayersFinished) {
        setShowResult(true);
        await saveResults();
        await fetchAndDeclareWinner();
      } else {
        setTimeout(checkResults, 2000); // Check again after 2 seconds
      }
    };

    checkResults();
  }, [roomId]);

  const handleNextQuestion = () => {
    setTotalTime((prev) => prev + (10 - timeLeft));
    if (currentQuestionIndex < initialQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(10);
      setSelectedAnswer(null);
    } else {
      // Finish the game and send the results
      setShowResult(true);
      saveResults();
    }
  };

  const handleAnswer = (answer) => {
    setAnswers((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, answer, time: 10 - timeLeft },
    ]);
    if (answer === initialQuestions[currentQuestionIndex].answer) {
      setRightAnswers((prev) => prev + 1);
    }
    setSelectedAnswer(answer);
    setTimeout(handleNextQuestion, 1000);
  };

  const saveResults = async () => {
    await fetch("/api/save-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId,
        playerName,
        totalTime,
        rightAnswers,
      }),
    });
  };

  const fetchAndDeclareWinner = async () => {
    const res = await fetch(`/api/get-results?roomId=${roomId}`);
    const data = await res.json();
    const winner = data.results.reduce((acc, player) => {
      if (
        !acc ||
        player.rightAnswers > acc.rightAnswers ||
        (player.rightAnswers === acc.rightAnswers &&
          player.totalTime < acc.totalTime)
      ) {
        return player;
      }
      return acc;
    }, null);

    if (winner && winner.playerName === playerName) {
      alert("Congratulations! You won the Fastest Finger First round!");
    }
  };

  const currentQuestion = initialQuestions[currentQuestionIndex];

  if (!playerName) {
    return (
      <div>
        <h1>Error</h1>
        <p>Player name is missing. Please go back to the lobby and enter your name.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Question {currentQuestionIndex + 1}</h1>
      {currentQuestion && (
        <>
          <h2>{currentQuestion.question}</h2>
          <ul>
            {currentQuestion.options.map((option, index) => (
              <li key={index}>
                <button
                  onClick={() => handleAnswer(option)}
                  style={{
                    backgroundColor:
                      selectedAnswer === null
                        ? ""
                        : option === currentQuestion.answer
                        ? "green"
                        : selectedAnswer === option
                        ? "red"
                        : "",
                  }}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p>Time left: {timeLeft}s</p>
      {showResult && <p>Calculating results...</p>}
    </div>
  );
};

export async function getServerSideProps(context) {
  const { roomId, playerName } = context.query;

  if (!playerName) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db("kbc");
    const roomsCollection = db.collection("rooms");

    const room = await roomsCollection.findOne({ roomId });

    if (!room || !room.questionIndexes || room.questionIndexes.length === 0) {
      throw new Error("Room data or question indexes are missing or invalid.");
    }

    const initialQuestions = questions.filter((_, index) =>
      room.questionIndexes.includes(index)
    );

    console.log("Initial Questions:", initialQuestions);

    return {
      props: {
        initialQuestions,
        roomId,
        playerName: playerName || null,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        initialQuestions: [],
        roomId,
        playerName: playerName || null,
      },
    };
  }
}

export default FastestFingerFirst;
