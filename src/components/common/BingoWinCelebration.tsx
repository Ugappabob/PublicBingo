import React from 'react';

const BingoWinCelebration: React.FC = () => {
  return (
    <div className="bingo-celebration-container">
      <div className="celebration-message">
        <h2>🎉 BINGO! 🎉</h2>
      </div>
      <div className="celebration-animation">
        {/* Dancing Grandma */}
        <div className="celebration-character grandma">
          <div className="character-body">
            <div className="head">👵</div>
            <div className="body">👗</div>
            <div className="arms">🎉</div>
          </div>
        </div>
        {/* Dancing Grandpa */}
        <div className="celebration-character grandpa">
          <div className="character-body">
            <div className="head">👴</div>
            <div className="body">👔</div>
            <div className="arms">🎊</div>
          </div>
        </div>
        {/* Additional celebrating seniors */}
        <div className="celebration-extras">
          <span className="extra-character">🧓</span>
          <span className="extra-character">👵</span>
          <span className="extra-character">🎯</span>
          <span className="extra-character">🎪</span>
        </div>
      </div>
    </div>
  );
};

export default BingoWinCelebration; 