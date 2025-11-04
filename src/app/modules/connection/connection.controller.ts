import { ConnectionService } from "./connection.service";
import { CreateContext, VoteContext } from "./connection.types";

export class ConnectionController {
  private service = new ConnectionService();

  /**
   * Handles POST /connections
   * (Placeholder for creating a new connection)
   */
  public async createConnection(context: CreateContext) {
    const { auth, body, set } = context;
    const result = await this.service.createConnection(auth, body);
    set.status = 201; // Created
    return { status: "success", data: result };
  }

  /**
   * Handles PATCH /connections/:id/reveal
   * Submits a user's vote to reveal.
   */
  public async handleRevealVote(context: VoteContext) {
    const { auth, params, body, set } = context;
    const result = await this.service.handleRevealVote(auth, params.id, body);
    set.status = 200; // OK
    return { status: "success", data: result };
  }
}
