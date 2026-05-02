import React, { useState, useEffect } from 'react';
import '../styles/BingoCelebration.css';

interface BingoCelebrationProps {
  isVisible: boolean;
  winnerName?: string;
  onClose?: () => void;
}

const BingoCelebration: React.FC<BingoCelebrationProps> = ({ 
  isVisible, 
  winnerName = 'Someone', 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setTimeout(() => setShowCharacters(true), 500);
      
      // Auto-close after 10 seconds if no manual close
      const autoCloseTimer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 10000);
      
      return () => clearTimeout(autoCloseTimer);
    } else {
      setShowConfetti(false);
      setShowCharacters(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="bingo-celebration-overlay">
      <div className="bingo-celebration">
        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Main Celebration Content */}
        <div className="celebration-content">
          <h1 className="bingo-title">🎉 BINGO! 🎉</h1>
          <p className="winner-text">{winnerName} won!</p>
          
          {/* Courage the Cowardly Dog Characters */}
          {showCharacters && (
            <div className="cartoon-characters">
              {/* Eustace Bagge - SVG Character */}
              <div className="character eustace">
                <svg 
                  className="eustace-svg" 
                  viewBox="0 0 300 447" 
                  width="120" 
                  height="180"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <style>
                      {`.line { stroke:#26211b; stroke-width:3; fill:none; }`}
                    </style>
                  </defs>
                  
                  <g id="eustace" className="eustace-celebration" transform="translate(0,0)">
                    {/* Torso / Overalls */}
                    <g id="torso" transform="translate(115,160)">
                      {/* shirt */}
                      <path d="M-28,-22 h56 v36 c0,20 -56,20 -56,0 z" fill="#efd9a7"/>
                      {/* overall body */}
                      <path d="M-38,14 h76 v148 c0,16 -76,16 -76,0z" fill="#7b8752"/>
                      {/* straps */}
                      <rect x="-38" y="4" width="18" height="22" rx="4" fill="#7b8752"/>
                      <rect x="20" y="4" width="18" height="22" rx="4" fill="#7b8752"/>
                      {/* buttons */}
                      <circle cx="-29" cy="14" r="6" fill="#2b2b2b"/>
                      <circle cx="29" cy="14" r="6" fill="#2b2b2b"/>
                    </g>

                    {/* Head (with glasses/nose simplified) */}
                    <g id="head" transform="translate(150,120)">
                      {/* head base */}
                      <ellipse cx="0" cy="0" rx="36" ry="28" fill="#e9d2bb"/>
                      {/* jaw */}
                      <ellipse cx="10" cy="16" rx="28" ry="16" fill="#e9d2bb"/>
                      {/* glasses */}
                      <circle cx="-12" cy="-2" r="9" fill="none" stroke="#93b09e" strokeWidth="3"/>
                      <circle cx="4" cy="-2" r="9" fill="none" stroke="#93b09e" strokeWidth="3"/>
                      <line x1="-3" y1="-2" x2="-1" y2="-2" stroke="#93b09e" strokeWidth="3"/>
                      {/* mouth */}
                      <rect x="-4" y="10" width="14" height="4" rx="2" fill="#3b2a20"/>
                      {/* ear */}
                      <circle cx="-34" cy="0" r="6" fill="#e9d2bb"/>
                    </g>

                    {/* Hat */}
                    <g id="hat" transform="translate(150,92)">
                      <path d="M-34,-8 h68 v16 h-68z" fill="#7e3f32"/>
                      <path d="M-46,-12 h92 v6 h-92z" fill="#7e3f32"/>
                      {/* brim */}
                      <path d="M32,-8 c30,4 30,6 0,10" fill="none" stroke="#7e3f32" strokeWidth="6" strokeLinecap="round"/>
                    </g>

                    {/* Left Arm (our left = his right) */}
                    <g id="upper_arm_L" transform="translate(84,170)">
                      <rect x="-8" y="0" width="16" height="54" rx="8" fill="#efd9a7"/>
                      <g id="lower_arm_L" transform="translate(0,50)">
                        <rect x="-7" y="0" width="14" height="48" rx="7" fill="#efd9a7"/>
                        <g id="hand_L" transform="translate(0,46)">
                          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#e9d2bb"/>
                        </g>
                      </g>
                    </g>

                    {/* Right Arm (our right = his left) */}
                    <g id="upper_arm_R" transform="translate(216,170)">
                      <rect x="-8" y="0" width="16" height="54" rx="8" fill="#efd9a7"/>
                      <g id="lower_arm_R" transform="translate(0,50)">
                        <rect x="-7" y="0" width="14" height="48" rx="7" fill="#efd9a7"/>
                        <g id="hand_R" transform="translate(0,46)">
                          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#e9d2bb"/>
                        </g>
                      </g>
                    </g>

                    {/* Left Leg */}
                    <g id="leg_L" transform="translate(128,318)">
                      <path d="M-8,0 h16 v72 c0,12 -16,12 -16,0z" fill="#6f7a48"/>
                      {/* shoe */}
                      <g id="foot_L" transform="translate(0,72)">
                        <path d="M-24,0 h48 c10,0 16,12 0,18 h-48 c-8,-8 0,-18 16,-18z" fill="#111" stroke="#f5f5f5" strokeWidth="2"/>
                      </g>
                    </g>

                    {/* Right Leg */}
                    <g id="leg_R" transform="translate(172,318)">
                      <path d="M-8,0 h16 v72 c0,12 -16,12 -16,0z" fill="#6f7a48"/>
                      <g id="foot_R" transform="translate(0,72)">
                        <path d="M-24,0 h48 c10,0 16,12 0,18 h-48 c-8,-8 0,-18 16,-18z" fill="#111" stroke="#f5f5f5" strokeWidth="2"/>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              {/* Muriel Bagge - The Sweet Wife */}
              <div className="character muriel">
                <div className="character-head">
                  <div className="muriel-hair"></div>
                  <div className="muriel-eyes">
                    <div className="eye left kind"></div>
                    <div className="eye right kind"></div>
                  </div>
                  <div className="muriel-mouth happy"></div>
                  <div className="muriel-glasses"></div>
                </div>
                <div className="character-body muriel-body">
                  <div className="muriel-dress"></div>
                  <div className="arms">
                    <div className="arm left wave"></div>
                    <div className="arm right wave"></div>
                  </div>
                </div>
                <div className="character-legs muriel-legs">
                  <div className="leg left"></div>
                  <div className="leg right"></div>
                </div>
              </div>
            </div>
          )}

          {/* Celebration Text */}
          <div className="celebration-messages">
            <p className="message">🎊 Congratulations! 🎊</p>
            <p className="message">🎯 You got BINGO! 🎯</p>
            <p className="message">🏆 Winner! 🏆</p>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="celebration-actions">
              <button className="celebration-close-btn" onClick={onClose}>
                ✨ Continue Playing ✨
              </button>
              <p className="auto-close-hint">(Auto-closes in 10 seconds)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BingoCelebration; 