'use client';

import { DECK, seatStyle } from '@/lib/game';
import { useRoom } from './useRoom';

export default function RoomClient({ roomId }: { roomId: string }) {
  const {
    name,
    nameDraft,
    setNameDraft,
    spectator,
    setSpectator,
    role,
    setRole,
    submitName,
    room,
    myId,
    status,
    errorMsg,
    me,
    isAdmin,
    voters,
    votesIn,
    results,
    devResults,
    qaResults,
    myVote,
    castVote,
    reveal,
    newRound,
    makeAdmin,
    toggleSpectator,
    switchRole,
    copied,
    copyLink,
  } = useRoom(roomId);

  const seats = room?.participants ?? [];

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
            <div className="role-toggle" role="radiogroup" aria-label="Join as">
              <button
                type="button"
                className={`btn btn-quiet ${role === 'DEV' ? 'active' : ''}`}
                aria-pressed={role === 'DEV'}
                onClick={() => setRole('DEV')}
              >
                DEV
              </button>
              <button
                type="button"
                className={`btn btn-quiet ${role === 'QA' ? 'active' : ''}`}
                aria-pressed={role === 'QA'}
                onClick={() => setRole('QA')}
              >
                QA
              </button>
            </div>
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
         {!me?.spectator && <div className="role-toggle" role="radiogroup" aria-label="Your role">
            <button
              type="button"
              className={`btn btn-quiet ${me?.role === 'DEV' ? 'active' : ''}`}
              aria-pressed={me?.role === 'DEV'}
              disabled={room?.revealed}
              title={room?.revealed ? 'Role can be changed before the next round' : undefined}
              onClick={() => switchRole('DEV')}
            >
              DEV
            </button>
            <button
              type="button"
              className={`btn btn-quiet ${me?.role === 'QA' ? 'active' : ''}`}
              aria-pressed={me?.role === 'QA'}
              disabled={room?.revealed}
              title={room?.revealed ? 'Role can be changed before the next round' : undefined}
              onClick={() => switchRole('QA')}
            >
              QA
            </button>
          </div>}
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
      {errorMsg && <p className="conn-note error">{errorMsg}</p>}

      <main className="table-zone">
        <div className="table-wrap">
          <div className="felt-table">
            <div className="table-status">
              {room?.revealed && results ? (
                <div className="results">
                  <div className="result-stat">
                    <div className="value">{results.average ?? '—'}</div>
                    <div className="label">Joint average</div>
                  </div>
                  <div className="result-stat">
                    <div className="value">{devResults?.average ?? '—'}</div>
                    <div className="label">DEV average</div>
                  </div>
                  <div className="result-stat">
                    <div className="value">{qaResults?.average ?? '—'}</div>
                    <div className="label">QA average</div>
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
                    {isAdmin ? (
                      <button
                        className="btn btn-gold"
                        onClick={newRound}
                      >
                        Start next round
                      </button>
                    ) : (
                      <p style={{ marginTop: '0.7rem' }}>
                        Waiting for the room admin to start the next round.
                      </p>
                    )}
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
                      : isAdmin
                        ? 'Reveal when everyone has picked.'
                        : 'Waiting for the room admin to reveal the cards.'}
                  </p>
                  {isAdmin && (
                    <button
                      className="btn btn-gold"
                      onClick={reveal}
                      disabled={votesIn === 0}
                    >
                      Reveal cards
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {seats.map((p, i) => {
            const isMe = p.id === myId;
            const isSeatAdmin = p.id === room?.adminId;
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
                  {isSeatAdmin && (
                    <span className="crown" title="Room admin" aria-label="Room admin">
                      👑
                    </span>
                  )}
                  {!p.spectator && (
                    <span className={`role-badge role-${p.role.toLowerCase()}`}>{p.role}</span>
                  )}
                  {p.name}
                  {isMe && <span className="you"> (you)</span>}
                </span>
                {isAdmin && !isMe && (
                  <button className="make-admin-btn" onClick={() => makeAdmin(p.id)}>
                    Make admin
                  </button>
                )}
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
