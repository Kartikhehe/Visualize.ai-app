import React, { useRef, useEffect, useState } from 'react';
import './VisualizationCanvas.css'; // You can create this file for styling the controls

// ✅ NEW HELPER FUNCTION FOR THE LOADING ANIMATION
const drawLoadingAnimation = (ctx, currentTime) => {
  const { width, height } = ctx.canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Animation timing (4-second loop for drawing and erasing)
  const loopDuration = 4000;
  const timeInLoop = currentTime % loopDuration;

  // --- Draw the static elements ---
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;

  // Easel
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY + 100);
  ctx.lineTo(centerX, centerY - 60);
  ctx.lineTo(centerX + 80, centerY + 100);
  ctx.stroke();
  ctx.strokeRect(centerX - 60, centerY - 50, 120, 90); // Canvas on easel

  // Boy's body
  ctx.beginPath();
  ctx.arc(centerX - 80, centerY, 20, 0, Math.PI * 2); // Head
  ctx.moveTo(centerX - 80, centerY + 20);
  ctx.lineTo(centerX - 80, centerY + 60); // Body
  ctx.moveTo(centerX - 80, centerY + 60);
  ctx.lineTo(centerX - 100, centerY + 100); // Left leg
  ctx.moveTo(centerX - 80, centerY + 60);
  ctx.lineTo(centerX - 60, centerY + 100); // Right leg
  ctx.stroke();

  // --- Animate the drawing arm and the scribble ---
  
  // Hand moves back and forth
  const armAngle = Math.sin(timeInLoop / 500) * 0.4; // Smoothly oscillates
  const handX = centerX - 80 + 45 * Math.cos(armAngle);
  const handY = centerY + 30 + 45 * Math.sin(armAngle);
  
  // Arm
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY + 30);
  ctx.lineTo(handX, handY);
  ctx.stroke();
  
  // Scribble on the easel
  ctx.beginPath();
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  const scribbleLength = (timeInLoop / loopDuration) * 100; // Line grows over the loop
  if (timeInLoop < loopDuration * 0.9) { // Pause before erasing
      ctx.moveTo(centerX - 50, centerY);
      for(let i = 0; i < scribbleLength; i++) {
          const x = centerX - 50 + i;
          const y = centerY + Math.sin(i * 0.2) * 10;
          ctx.lineTo(x, y);
      }
  }
  ctx.stroke();
  
  // Loading Text
  ctx.fillStyle = '#666';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('No worries, your bro is sketching this out...', centerX, centerY + 140);
};


const VisualizationCanvas = ({ visualization, isLoading }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const animationFrameId = useRef(null);
  const startTimeRef = useRef(performance.now());
  const pauseTimeRef = useRef(0);

  useEffect(() => {
    const loop = (currentTime) => {
      // Keep looping if playing OR if it's in a loading state
      if (isPlaying || isLoading) {
        drawFrame(currentTime);
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    if (isPlaying || isLoading) {
      if (pauseTimeRef.current > 0) {
        const pauseDuration = performance.now() - pauseTimeRef.current;
        startTimeRef.current += pauseDuration;
      }
      animationFrameId.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [visualization, isLoading, isPlaying]);

  useEffect(() => {
    setIsPlaying(true);
    setProgress(0);
    startTimeRef.current = performance.now();
    pauseTimeRef.current = 0;
  }, [visualization]);

  const drawFrame = (currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ MODIFIED: Call the new loading animation function
    if (isLoading) {
      drawLoadingAnimation(ctx, currentTime);
      return; // Stop here and don't draw the main visualization
    }
    
    if (!visualization || !visualization.layers) return;
    
    const elapsedTime = currentTime - startTimeRef.current;
    const loopElapsedTime = elapsedTime % visualization.duration;
    const currentProgress = loopElapsedTime / visualization.duration;
    
    setProgress(currentProgress);
    const effectiveElapsedTime = visualization.duration * currentProgress;

    // Drawing logic for the main visualization (remains the same)
    visualization.layers.forEach(layer => {
      let props = { ...layer.props };
      if (layer.animations) {
        layer.animations.forEach(anim => {
          const timeIntoAnim = effectiveElapsedTime - anim.start;
          if (timeIntoAnim >= 0) {
            const animDuration = anim.end - anim.start;
            const animProgress = Math.min(timeIntoAnim / animDuration, 1);
            if (animProgress >= 0) {
              props[anim.property] = anim.from + (anim.to - anim.from) * animProgress;
            }
          }
        });
      }
      ctx.globalAlpha = props.opacity ?? 1;
      if (layer.type === 'circle') {
          ctx.beginPath();
          ctx.arc(props.x, props.y, props.r, 0, 2 * Math.PI);
          ctx.fillStyle = props.fill;
          ctx.fill();
        } else if (layer.type === 'text') {
          ctx.font = props.font;
          ctx.fillStyle = props.fill;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.content, props.x, props.y);
        } else if (layer.type === 'arrow') {
          const { x, y, dx, dy, color } = props;
          const headlen = 10;
          const angle = Math.atan2(dy, dx);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dx, y + dy);
          ctx.moveTo(x + dx, y + dy);
          ctx.lineTo(x + dx - headlen * Math.cos(angle - Math.PI / 6), y + dy - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(x + dx, y + dy);
          ctx.lineTo(x + dx - headlen * Math.cos(angle + Math.PI / 6), y + dy - headlen * Math.sin(angle + Math.PI / 6));
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      ctx.globalAlpha = 1;
    });
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTimeRef.current = performance.now();
    }
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  };
  
  const handleScrub = (e) => {
    // Scrubbing logic remains the same
    const newProgress = parseFloat(e.target.value);
    setIsPlaying(false);
    setProgress(newProgress);
    const effectiveElapsedTime = visualization.duration * newProgress;
    startTimeRef.current = performance.now() - effectiveElapsedTime;
    drawFrame(performance.now()); 
  }

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} style={{ border: '1px solid #ccc' }} />
      {/* Hide controls while loading */}
      {!isLoading && (
        <div className="controls-container">
          <button onClick={handlePlayPause} className="control-button" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z"></path></svg>
            )}
          </button>
          <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={progress} 
              onChange={handleScrub}
              className="progress-scrubber"
          />
        </div>
      )}
    </div>
  );
};

export default VisualizationCanvas;