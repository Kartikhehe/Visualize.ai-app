import React, { useEffect, useRef } from 'react';
import LoadingAnimation from './LoadingAnimation'; // ✅ IMPORT THE NEW COMPONENT

// ✅ ACCEPT THE isLoading PROP
const ChatPanel = ({ questions, answers, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ ADD isLoading TO THE DEPENDENCY ARRAY
  // This ensures we scroll down when the loading animation appears
  useEffect(scrollToBottom, [questions, answers, isLoading]);

  return (
    <div className="chat-panel">
      {questions.map((q) => (
        <React.Fragment key={q.id}>
          <div className="message question">{q.question}</div>
          <div className="message answer">
            {answers[q.answerId] ? (
              answers[q.answerId].text
            ) : (
              // Hide the old "Generating..." text if our new component is showing
              !isLoading && <span className="loading">Waiting for answer...</span>
            )}
          </div>
        </React.Fragment>
      ))}
      

      {isLoading && <LoadingAnimation />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatPanel;