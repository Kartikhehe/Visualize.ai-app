import React, { useState, useEffect } from 'react';
import './App.css';
import ChatPanel from './components/ChatPanel';
import VisualizationCanvas from './components/VisualizationCanvas';
import QuestionInput from './components/QuestionInput';
import Navbar from './components/Navbar';

const API_URL = 'https://visualize-ai-app-backend-vr4j.vercel.app';

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentVisId, setCurrentVisId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This useEffect hook for fetching initial data and setting up SSE remains the same.
    fetch(`${API_URL}/api/questions`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        if (data.length > 0) {
            const lastQuestion = data[data.length - 1];
            setCurrentVisId(lastQuestion.answerId);
            // This fetch is a bit inefficient but works for this simplified model
            fetch(`${API_URL}/api/answers/${lastQuestion.answerId}`)
                .then(res => res.json())
                .then(answerData => setAnswers(prev => ({ ...prev, [lastQuestion.answerId]: answerData })))
        }
      });

    const eventSource = new EventSource(`${API_URL}/api/stream`);
    eventSource.onopen = () => console.log('SSE connection opened');
    eventSource.onerror = (err) => console.error('SSE error:', err);

    eventSource.addEventListener('question_created', (event) => {
      const newQuestion = JSON.parse(event.data);
      setQuestions(prev => [...prev, newQuestion]);
    });

    eventSource.addEventListener('answer_created', (event) => {
      const newAnswer = JSON.parse(event.data);
      setAnswers(prev => ({ ...prev, [newAnswer.id]: newAnswer }));
      setCurrentVisId(newAnswer.id);
      setIsLoading(false); 
    });

    return () => {
      eventSource.close();
      console.log('SSE connection closed');
    };
  }, []);

  const handleAskQuestion = async (question) => {
    setIsLoading(true); 
    try {
      await fetch(`${API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'u1', question }),
      });
    } catch (error) {
      console.error('Failed to ask question:', error);
      setIsLoading(false); 
    }
  };

  // ✅ MODIFIED: This function now permanently deletes the chat on the server.
  const handleNewChat = async () => {
    setIsLoading(true); // Show loading state while deleting
    try {
      // Step 1: Tell the backend to delete its history
      await fetch(`${API_URL}/api/chat`, { method: 'DELETE' });

      // Step 2: After successful deletion, clear the frontend state
      setQuestions([]);
      setAnswers({});
      setCurrentVisId(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };
  
  const currentVisualization = currentVisId ? answers[currentVisId]?.visualization : null;

  return (
    <>
      <Navbar onNewChat={handleNewChat} /> 
      <div className="app">
        <div className="visualization-container">
          {(currentVisualization || isLoading) ? (
            <VisualizationCanvas
              visualization={currentVisualization}
              isLoading={isLoading}
            />
          ) : (
            <div className="placeholder">Ask a question to see a visualization!</div>
          )}
        </div>
        <div className="chat-container">
          <ChatPanel 
            questions={questions} 
            answers={answers} 
            isLoading={isLoading} 
          />
          <QuestionInput onAsk={handleAskQuestion} />
        </div>
      </div>
    </>
  );
}

export default App;