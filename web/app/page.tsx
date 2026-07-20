'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAME_KEY, SOCKET_URL, randomRoomId } from '@/lib/game';

const FAN = [
  { value: '3', angle: -24 },
  { value: '5', angle: -12 },
  { value: '8', angle: 0 },
  { value: '13', angle: 12 },
  { value: '?', angle: 24 },
];

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? '');
  }, []);

  function rememberName() {
    if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
  }

  async function createRoom() {
    setCreating(true);
    rememberName();
    let roomId = randomRoomId();
    try {
      const res = await fetch(`${SOCKET_URL}/rooms`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { roomId: string };
        roomId = data.roomId;
      }
    } catch {
      // server unreachable right now — the room is created on first join anyway
    }
    router.push(`/room/${roomId}`);
  }

  function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.replace(/\D/g, '');
    if (code.length !== 8) return;
    rememberName();
    router.push(`/room/${code}`);
  }

  return (
    <main className="landing">
      <header className="landing-header">
        <span className="suit-mark" aria-hidden>
          ♠
        </span>
        <strong className="display" style={{ fontSize: '1.2rem' }}>
          Scrum Poker Online
        </strong>
      </header>

      <section className="landing-hero">
        <div>
          <h1 className="display">
            Estimate stories <em>together</em>, reveal them at once.
          </h1>
          <p>
            Free planning poker for agile teams. Open a table, send your teammates the
            link, and vote in real time — no accounts, no installs.
          </p>

          <div className="landing-form">
            <input
              className="input"
              placeholder="Your name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              aria-label="Your name"
            />
            <button className="btn btn-gold" onClick={createRoom} disabled={creating}>
              {creating ? 'Opening a table…' : 'Start a new game'}
            </button>
            <div className="divider">or join one</div>
            <form className="join-row" onSubmit={joinRoom}>
              <input
                className="input mono"
                placeholder="8-digit room code"
                inputMode="numeric"
                value={joinCode}
                maxLength={8}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
                aria-label="Room code"
              />
              <button className="btn btn-quiet" type="submit">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="hero-fan" aria-hidden>
          {FAN.map((card, i) => (
            <div
              key={card.value}
              className="fan-card display"
              style={{
                transform: `translateX(-50%) rotate(${card.angle}deg)`,
                animationDelay: `${i * 90}ms`,
                zIndex: i,
              }}
            >
              <small>♠</small>
              {card.value}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <div className="how-card">
          <h3 className="display">1 · Open a table</h3>
          <p>Start a game and get a room link with an 8-digit code, like a seat number at the table.</p>
        </div>
        <div className="how-card">
          <h3 className="display">2 · Deal the team in</h3>
          <p>Share the link. Everyone picks a card from the Fibonacci deck — votes stay face down.</p>
        </div>
        <div className="how-card">
          <h3 className="display">3 · Reveal together</h3>
          <p>Flip all cards at once, see the average and agreement, then start the next round.</p>
        </div>
      </section>
    </main>
  );
}
