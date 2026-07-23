export interface PublicParticipant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string | null;
  spectator: boolean;
}

export interface RoomState {
  id: string;
  revealed: boolean;
  round: number;
  participants: PublicParticipant[];
  adminId: string | null;
}
