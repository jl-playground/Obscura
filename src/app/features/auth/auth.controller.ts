import { AuthService } from "./auth.service";
import type { RegisterDto, LoginDto } from "./auth.dto";
import type { Context } from "elysia"; // For 'set' type

// We define the types for the handler context
type RegisterContext = { body: RegisterDto; set: Context["set"] };
type LoginContext = { body: LoginDto; set: Context["set"] };
type ValidateTokenContext = { body: any; set: Context["set"] };
type ResetPasswordContext = { body: { email: string }; set: Context["set"] };
type NewPasswordContext = {
  body: {
    temporaryToken: string;
    newPassword: string;
    confirmPassword: string;
  };
  set: Context["set"];
};

export class AuthController {
  // The service is instantiated as a private member
  private authService = new AuthService();

  /**
   * Handles the POST /auth/register request.
   * Calls the service, sets status codes, and returns a JSON response.
   */
  public async register({ body, set }: RegisterContext) {
    try {
      console.log(body);

      const result = await this.authService.register(body);
      console.log(result);

      set.status = 201; // 201 Created
      return {
        status: "success",
        data: result,
      };
    } catch (error: any) {
      set.status = 409; // 409 Conflict (e.g., user already exists)
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  public async validateToken({ body, set }: ValidateTokenContext) {
    try {
      const result = await this.authService.validateToken(body);
      console.log(result);

      set.status = 201;
      return {
        status: "success",
        data: result,
      };
    } catch (error: any) {
      set.status = 409; // 409 Conflict (e.g., user already exists)
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  /**
   * Handles the POST /auth/login request.
   * Calls the service, sets status codes, and returns a JSON response.
   */
  public async login({ body, set }: LoginContext) {
    try {
      const result = await this.authService.login(body);
      set.status = 200; // 200 OK
      return {
        status: "success",
        data: result,
      };
    } catch (error: any) {
      set.status = 401; // 401 Unauthorized (invalid credentials)
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  public async passwordReset({ body, set }: ResetPasswordContext) {
    try {
      const result = await this.authService.passwordReset(body);

      set.status = 200; // 200 OK
      return {
        status: "success",
        data: result,
      };
    } catch (error: any) {
      set.status = 401; // 401 Unauthorized (invalid credentials)
      return {
        status: "error",
        message: error.message,
      };
    }
  }
  public async newPassword({ body, set }: NewPasswordContext) {
    try {
      const result = await this.authService.newPassword(body);

      set.status = 200; // 200 OK
      return {
        status: "success",
        data: result,
      };
    } catch (error: any) {
      set.status = 401; // 401 Unauthorized (invalid credentials)
      return {
        status: "error",
        message: error.message,
      };
    }
  }
}
