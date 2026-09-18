import type { Metadata } from 'next';
import { RoomBoard } from '@/widgets/room-board';

export const metadata: Metadata = {
  title: 'Room · Scrum Poker Online',
};

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomBoard roomId={id} />;
}
