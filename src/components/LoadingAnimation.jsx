import React from 'react';
import './LoadingAnimation.css';

// You can replace this with an actual image if you prefer
// For example: <img src="/bot-avatar.png" alt="AI Avatar" />
const BotAvatar = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#EAEAEA"/>
    <path d="M20 13C23.3137 13 26 15.6863 26 19V21H14V19C14 15.6863 16.6863 13 20 13Z" fill="#B0B0B0"/>
    <circle cx="17" cy="18" r="1" fill="white"/>
    <circle cx="23" cy="18" r="1" fill="white"/>
    <rect x="14" y="22" width="12" height="5" rx="1" fill="#B0B0B0"/>
  </svg>
);


const LoadingAnimation = () => {
  return (
    <div className="loading-animation message">
      <div className="loading-avatar">
        <BotAvatar />
      </div>
      <div className="loading-content">
        <p className="loading-title">Your Bruh is thinking...</p>
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
        <p className="loading-subtitle">Generating your explanation & visualization ✨</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;