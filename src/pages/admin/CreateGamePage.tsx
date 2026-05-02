import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateGame } from '../../components/admin/CreateGame';

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGameCreated = (gameId: string) => {
    navigate(`/admin/games/${gameId}`);
  };

  return (
    <div className="admin-page">
      <h1>Create New Game</h1>
      <CreateGame onGameCreated={handleGameCreated} />
    </div>
  );
}; 