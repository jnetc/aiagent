export interface TwitterProfile {
  id: string;
  username: string;
  displayName: string;
  photos?: Array<{ value: string }>;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  pro: boolean;
  tokenGatePassed: boolean;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}