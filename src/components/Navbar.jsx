import React from 'react';
import './Navbar.css';


const Navbar = ({ onNewChat }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Visualize.Ai App</h1>
      </div>
      <div className="navbar-links">

        <button onClick={onNewChat} className="navbar-button new-chat-button">
          + New Chat
        </button>
        <a 
          href="https://drive.google.com/file/d/1aMXgIiNskXFVap0xbDmKZ6HKgFPSUKy1/view?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="navbar-button"
        >
          About Me
        </a>
      </div>
    </nav>
  );
};

export default Navbar;