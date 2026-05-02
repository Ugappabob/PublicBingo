import { DashboardStats, GameReport } from '../types/admin';
import { ErrorResponse } from '../types/errors';

class AdminService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/admin`;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
    return response.json();
  }

  async createGame(templateId: string): Promise<{ gameId: string }> {
    const response = await fetch(`${this.baseUrl}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId })
    });
    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || 'Failed to create game');
    }
    return response.json();
  }

  async createTemplate(name: string, phrases: string[]): Promise<{ templateId: string }> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phrases })
    });
    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || 'Failed to create template');
    }
    return response.json();
  }

  async getGameReport(gameId: string): Promise<GameReport> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}/report`);
    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || 'Failed to fetch game report');
    }
    return response.json();
  }
}

export default AdminService; 