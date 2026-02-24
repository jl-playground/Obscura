import ConnectionRepository from './connection.repository';

import type Connection from '@/app/core/database/entities/connection.entity';
import type { CreationAttributes } from 'sequelize';

const REVEAL_MESSAGE_THRESHOLD = 5; // Auto-reveal after 5 messages

export default class ConnectionService {
  private repository: ConnectionRepository;

  constructor() {
    this.repository = new ConnectionRepository();
  }

  async createConnection(userAId: string, userBId: string): Promise<Connection> {
    // Validate users are different
    if (userAId === userBId) {
      throw new Error('Cannot create connection with yourself');
    }

    // Check if connection already exists (both directions)
    const existingConnection = await this.repository.findExistingConnection(userAId, userBId);

    if (existingConnection) {
      throw new Error('Connection already exists between these users');
    }

    // Create new connection with status PENDING
    const connection = await this.repository.create({
      user_a_id: userAId,
      user_b_id: userBId,
      status: 'PENDING',
      message_count: 0,
      user_a_reveal_vote: null,
      user_b_reveal_vote: null,
    } as CreationAttributes<Connection>);

    return connection;
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return this.repository.findUserConnections(userId);
  }

  async getConnectionById(id: string): Promise<Connection> {
    const connection = await this.repository.findByPk(id);

    if (!connection) {
      throw new Error('Connection not found');
    }

    return connection;
  }

  async verifyUserInConnection(connectionId: string, userId: string): Promise<boolean> {
    const connection = await this.getConnectionById(connectionId);
    return connection.user_a_id === userId || connection.user_b_id === userId;
  }

  async handleRevealVote(connectionId: string, userId: string, vote: boolean): Promise<Connection> {
    const connection = await this.getConnectionById(connectionId);

    // Verify user is part of connection
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      throw new Error('User is not part of this connection');
    }

    // Update the appropriate user's reveal vote
    const updateData: Partial<CreationAttributes<Connection>> = {};

    if (connection.user_a_id === userId) {
      updateData.user_a_reveal_vote = vote;
    } else {
      updateData.user_b_reveal_vote = vote;
    }

    // Check if both users have voted to reveal
    const updatedVoteA = connection.user_a_id === userId ? vote : connection.user_a_reveal_vote;
    const updatedVoteB = connection.user_b_id === userId ? vote : connection.user_b_reveal_vote;

    if (updatedVoteA === true && updatedVoteB === true) {
      updateData.status = 'REVEALED';
    }

    // Update connection
    const [, [updatedConnection]] = await this.repository.update(connectionId, updateData);

    return updatedConnection;
  }

  async incrementMessageCount(connectionId: string): Promise<void> {
    await this.repository.incrementMessageCount(connectionId);

    // Check if should auto-reveal based on message count
    const connection = await this.getConnectionById(connectionId);

    if (connection.status === 'PENDING' && connection.message_count >= REVEAL_MESSAGE_THRESHOLD) {
      // Auto-change to REVEALED for reveal voting
      await this.repository.update(connectionId, {
        status: 'PENDING', // Keep PENDING, users must still vote to reveal
      });
    }
  }

  async deleteConnection(id: string): Promise<number> {
    return this.repository.delete(id);
  }

  async restoreConnection(id: string): Promise<number> {
    return this.repository.restore(id);
  }
}
