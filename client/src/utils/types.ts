export type TimersFilter = {
  friendId: undefined | number; // when undefined, get all
};

export type Friend = {
  id: number;
  name: string;
};

export type TimerResponse = {
  error?: string;
  message?: string;
  id: number;
  name: string;
  start: Date;
  created_by: Friend;
  referenced_friends: Friend[];
};

export type TokenResponse = {
  error?: string;
  message?: string;
  token?: string;
  expiration?: string;
  friend: Friend;
};

export type SignThisTokenResponse = {
  error?: string;
  message?: string;
  token?: string;
};
