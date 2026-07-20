import type { Metadata } from 'next';
import RoomClient from './RoomClient';

export const metadata: Metadata = {
  title: 'Room · Scrum Poker Online',
};

export default function RoomPage({ params }: { params: { id: string } }) {
  return <RoomClient roomId={params.id} />;
}
