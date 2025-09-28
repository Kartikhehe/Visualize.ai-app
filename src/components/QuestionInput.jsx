import React, { useState } from 'react';

const QuestionInput = ({ onAsk }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    // Add this line to prevent the page from reloading
    e.preventDefault(); 
    
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-input-form">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a scientific question..."
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default QuestionInput;