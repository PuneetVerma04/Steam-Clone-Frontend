export enum UserRole {
  Player = 'Player',
  Publisher = 'Publisher',
  Admin = 'Admin',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
}
