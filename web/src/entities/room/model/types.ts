export type Role = 'DEV' | 'QA';

export interface PublicParticipant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string | null;
  spectator: boolean;
  role: Role;
}

export interface RoomState {
  id: string;
  revealed: boolean;
  round: number;
  participants: PublicParticipant[];
  adminId: string | null;
}
