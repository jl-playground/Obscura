// This interface defines the data we expect for a registration request.
export interface RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// This interface defines the data we expect for a login request.
export interface LoginDto {
  email: string;
  password: string;
}

// This is the data we will encode into our JWTs.
// It acts as the "passport" for an authenticated user.
export interface AuthPayload {
  userId: string;
  profileId: string;
}

export interface RegisterPayload {
  userId: string;
  firstName: string;
  lastName: string;
  profileId: string;
}

export interface PassPayload {
  userId: string;
  passedProfileId: string;
}

export interface MatchPayload {
  userId: string;
  matchedProfileId: string;
}
