export const ROOM_EVENTS = {
  JOIN: 'room:join',
  VOTE: 'room:vote',
  REVEAL: 'room:reveal',
  RESET: 'room:reset',
  TRANSFER_ADMIN: 'room:transfer-admin',
  SPECTATOR: 'room:spectator',
  ROLE: 'room:role',
  STATE: 'room:state',
  ERROR: 'room:error',
} as const;
