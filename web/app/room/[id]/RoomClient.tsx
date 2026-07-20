'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { DECK, NAME_KEY, SOCKET_URL, cardNumericValue } from '@/lib/game';

interface PublicParticipant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string | null;
  spectator: boolean;
}

interface RoomState {
  id: string;
  revealed: boolean;
  round: number;
  participants: PublicParticipant[];
}

type ConnStatus = 'connecting' | 'connected' | 'error';

export default function RoomClient({ roomId }: { roomId: string }) {
  const [name, setName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [spectator, setSpectator] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnStatus>('connecting');
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Load a remembered name once on the client
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setName(saved);
    setNameDraft(saved ?? '');
  }, []);

  // Connect once we know who the player is
  useEffect(() => {
    if (!name) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyId(socket.id ?? null);
      setStatus('connected');
      socket.emit('room:join', { roomId, name, spectator });
    });
    socket.on('room:state', (state: RoomState) => setRoom(state));
    socket.on('connect_error', () => setStatus('error'));
    socket.on('disconnect', () => setStatus('connecting'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // spectator changes are sent through their own event, not a reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, roomId]);

  const me = useMemo(
    () => room?.participants.find((p) => p.id === myId) ?? null,
    [room, myId],
  );

  const voters = useMemo(
    () => room?.participants.filter((p) => !p.spectator) ?? [],
    [room],
  );

  const votesIn = voters.filter((p) => p.hasVoted).length;

  const results = useMemo(() => {
    if (!room?.revealed) return null;
    const values = voters
      .map((p) => (p.vote != null ? cardNumericValue(p.vote) : null))
      .filter((v): v is number => v !== null);
    const cast = voters.filter((p) => p.vote != null);
    const average = values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
    const consensus =
      cast.length > 1 && cast.every((p) => p.vote === cast[0].vote) ? cast[0].vote : null;
    return { average, consensus, castCount: cast.length };
  }, [room, voters]);

  // My selected card comes from server state after reveal; before reveal we track it locally
  const [myVote, setMyVote] = useState<string | null>(null);
  useEffect(() => {
    if (room && !room.revealed && me && !me.hasVoted) setMyVote(null);
  }, [room, me]);
  useEffect(() => {
    // new round → clear local selection
    setMyVote(null);
  }, [room?.round]);

  const submitName = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = nameDraft.trim();
      if (!trimmed) return;
      localStorage.setItem(NAME_KEY, trimmed);
      setName(trimmed);
    },
    [nameDraft],
  );

  function castVote(value: string) {
    if (!room || room.revealed || me?.spectator) return;
    setMyVote((prev) => (prev === value ? null : value));
    socketRef.current?.emit('room:vote', { value });
  }

  function reveal() {
    socketRef.current?.emit('room:reveal');
  }

  function newRound() {
    socketRef.current?.emit('room:reset');
  }

  function toggleSpectator() {
    const next = !spectator;
    setSpectator(next);
    setMyVote(null);
    socketRef.current?.emit('room:spectator', { spectator: next });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the visible code still lets people join manually
    }
  }

  // seat positions around the table ellipse
  const seats = room?.participants ?? [];
  const seatStyle = (index: number, total: number): React.CSSProperties => {
    const angle = (-90 + (360 / Math.max(total, 1)) * index) * (Math.PI / 180);
    const left = 50 + 41 * Math.cos(angle);
    const top = 50 + 40 * Math.sin(angle);
    return { left: `${left}%`, top: `${top}%` };
  };

  if (!name) {
    return (
      <div className="overlay">
        <div className="overlay-card">
          <h2 className="display">Take a seat</h2>
          <p>
            Joining table <span className="mono">{roomId}</span>. What name should be on
            your card?
          </p>
          <form onSubmit={submitName}>
            <input
              className="input"
              placeholder="Your name"
              value={nameDraft}
              maxLength={24}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              aria-label="Your name"
            />
            <label className="check-row">
              <input
                type="checkbox"
                checked={spectator}
                onChange={(e) => setSpectator(e.target.checked)}
              />
              Join as spectator (watch without voting)
            </label>
            <button className="btn btn-gold" type="submit">
              Join the table
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="room">
      <header className="room-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span className="suit-mark" aria-hidden>
            ♠
          </span>
          <strong className="display">Scrum Poker</strong>
        </div>

        <div className="room-code">
          <span className="code mono">{roomId}</span>
          <button className="copy-btn" onClick={copyLink}>
            {copied ? 'Copied ✓' : 'Copy invite link'}
          </button>
        </div>

        <div className="header-actions">
          <span className="round-chip">Round {room?.round ?? 1}</span>
          <button className="btn btn-quiet" onClick={toggleSpectator}>
            {me?.spectator ? 'Join the vote' : 'Spectate'}
          </button>
        </div>
      </header>

      {status === 'error' && (
        <p className="conn-note error">
          Can’t reach the game server. Check that it’s running and refresh.
        </p>
      )}
      {status === 'connecting' && (
        <p className="conn-note">Connecting to the table…</p>
      )}

      <main className="table-zone">
        <div className="table-wrap">
          <div className="felt-table">
            <div className="table-status">
              {room?.revealed && results ? (
                <div className="results">
                  <div className="result-stat">
                    <div className="value">{results.average ?? '—'}</div>
                    <div className="label">Average</div>
                  </div>
                  <div className="result-stat">
                    <div className="value">
                      {results.castCount}/{voters.length}
                    </div>
                    <div className="label">Votes cast</div>
                  </div>
                  <div style={{ width: '100%' }}>
                    {results.consensus && (
                      <div className="consensus">Consensus on {results.consensus} 🎉</div>
                    )}
                    <button
                      className="btn btn-gold"
                      onClick={newRound}
                      style={{ marginTop: '0.7rem' }}
                    >
                      Start next round
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <strong className="display">
                    {votesIn}/{voters.length || '–'} cards on the table
                  </strong>
                  <p>
                    {voters.length < 2
                      ? 'Share the invite link to deal your team in.'
                      : 'Reveal when everyone has picked.'}
                  </p>
                  <button
                    className="btn btn-gold"
                    onClick={reveal}
                    disabled={votesIn === 0}
                  >
                    Reveal cards
                  </button>
                </div>
              )}
            </div>
          </div>

          {seats.map((p, i) => {
            const isMe = p.id === myId;
            const cardClass = p.spectator
              ? 'seat-card spectator'
              : room?.revealed
                ? 'seat-card revealed'
                : p.hasVoted
                  ? 'seat-card'
                  : 'seat-card empty';
            return (
              <div key={p.id} className="seat" style={seatStyle(i, seats.length)}>
                <div className={cardClass}>
                  <div className="flip">
                    <div className="face face-down">{p.spectator ? '👁' : ''}</div>
                    <div className={`face face-up ${p.vote == null ? 'no-vote' : ''}`}>
                      {p.spectator ? '' : p.vote == null ? 'no vote' : p.vote}
                    </div>
                  </div>
                </div>
                <span className="seat-name">
                  {p.name}
                  {isMe && <span className="you"> (you)</span>}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {!me?.spectator && (
        <footer className="hand-zone">
          <p className="hand-hint">
            {room?.revealed
              ? 'Cards are face up — start the next round to vote again.'
              : 'Pick your estimate. Tap the same card again to take it back.'}
          </p>
          <div className="hand" role="group" aria-label="Estimate cards">
            {DECK.map((value) => (
              <button
                key={value}
                className={`hand-card ${myVote === value ? 'selected' : ''}`}
                onClick={() => castVote(value)}
                disabled={room?.revealed || status !== 'connected'}
                aria-pressed={myVote === value}
              >
                {value}
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
