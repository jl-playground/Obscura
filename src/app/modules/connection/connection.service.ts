import { ConnectionRepository } from "./connection.repository";
import { ProfileRepository } from "@/app/modules/profile/profile.repository";
import { Connection, ConnectionStatus } from "./connection.entity";
import type { RevealVoteDto, CreateConnectionDto } from "./connection.dto";
import type { AuthPayload } from "@/app/modules/auth/auth.dto";

export class ConnectionService {
  private connectionRepo = ConnectionRepository;
  private profileRepo = ProfileRepository;

  /**
   * (Placeholder) Manually creates a new connection with another user.
   */
  public async createConnection(auth: AuthPayload, dto: CreateConnectionDto) {
    const { userId: myUserId } = auth;
    const { recipientProfileId } = dto;

    // 1. Find the recipient's profile to get their user ID
    const recipientProfile = await this.profileRepo.findOne({
      where: { id: recipientProfileId },
    });

    if (!recipientProfile) {
      // --- CORRECTED ---
      throw new Error("Recipient profile not found.");
    }
    const recipientUserId = recipientProfile.user_id;

    // 2. Prevent self-connection
    if (myUserId === recipientUserId) {
      // --- CORRECTED ---
      throw new Error("You cannot create a connection with yourself.");
    }

    // 3. Check if a connection already exists
    const existingConnection =
      await this.connectionRepo.findConnectionBetweenUsers(
        myUserId,
        recipientUserId,
      );

    if (existingConnection) {
      // --- CORRECTED ---
      throw new Error("A connection with this user already exists.");
    }

    // 4. Create the new connection
    const newConnection = this.connectionRepo.create({
      user_a_id: myUserId,
      user_b_id: recipientUserId,
      status: ConnectionStatus.PENDING, // PENDING until first message
    });

    return this.connectionRepo.save(newConnection);
  }

  /**
   * Processes a user's vote to mutually reveal.
   */
  public async handleRevealVote(
    auth: AuthPayload,
    connectionId: string,
    dto: RevealVoteDto,
  ) {
    const { userId } = auth;

    // 1. Find the connection
    const connection = await this.connectionRepo.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      // --- CORRECTED ---
      throw new Error("Connection not found.");
    }

    // 2. Check if the user is part of this connection
    const isUserA = connection.user_a_id === userId;
    const isUserB = connection.user_b_id === userId;

    if (!isUserA && !isUserB) {
      // --- CORRECTED ---
      throw new Error("You are not a part of this connection.");
    }

    // 3. Check if the threshold is met (message_count)
    if (connection.status !== ConnectionStatus.REVEAL_READY) {
      // --- CORRECTED ---
      throw new Error("The reveal threshold has not been met.");
    }

    // 4. Record the vote
    const { vote } = dto;
    let otherUserVote: boolean | null = null;

    if (isUserA) {
      connection.user_a_reveal_vote = vote;
      otherUserVote = connection.user_b_reveal_vote;
    } else {
      // isUserB
      connection.user_b_reveal_vote = vote;
      otherUserVote = connection.user_a_reveal_vote;
    }

    // 5. Check for Mutual Reveal
    if (vote === true && otherUserVote === true) {
      // SUCCESS! Both users have agreed.
      connection.status = ConnectionStatus.REVEALED;
    }

    await this.connectionRepo.save(connection);

    return {
      status: "success",
      message: "Your vote has been recorded.",
      connectionStatus: connection.status,
    };
  }
}
