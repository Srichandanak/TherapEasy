import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./SpeechRecognition.css";
const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "How can a clam cram in a clean cream can?",
  "I saw a kitten eating chicken in the kitchen.",
  "A proper copper coffee pot.",
];

const SpeechTest = () => {
  const [currentSentence, setCurrentSentence] = useState("");
  const [timer, setTimer] = useState(20);
  const [testActive, setTestActive] = useState(false);
  const [score, setScore] = useState(null);
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (testActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [testActive, timer]);

  const startTest = () => {
    setCurrentSentence(sentences[Math.floor(Math.random() * sentences.length)]);
    setTimer(20);
    setTestActive(true);
    setScore(null);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopTest = async () => {
    SpeechRecognition.stopListening();
    setTestActive(false);
    
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userSpeech: transcript, correctText: currentSentence })
    });
    const data = await response.json();
    setScore(data.score);
  };

  return (
    <div className="p-6 bg-yellow-100 rounded-lg text-center">
      <h2 className="text-lg font-bold mb-4 text-green-500">Speech Test</h2>
      {testActive ? (
        <>
          <p className="text-lg font-semibold">{currentSentence}</p>
          <p className="text-red-500">Time Left: {timer}s</p>
          <button onClick={stopTest} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md">Stop Test</button>
        </>
      ) : (
        <button onClick={startTest} className="bg-blue-500 text-black px-4 py-2 rounded-md">Test Your Performance</button>
      )}
      {score !== null && <p className="mt-4 text-green-600 font-bold">Your Score: {score}/100</p>}
    </div>
  );
};

export default SpeechTest;
