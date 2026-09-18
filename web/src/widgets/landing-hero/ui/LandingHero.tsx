import { HeroFanCards } from './HeroFanCards';
import { LandingActions } from './LandingActions';

/** Fully static landing shell — server-rendered, with `LandingActions` as its only client island. */
export function LandingHero() {
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

          <LandingActions />
        </div>

        <HeroFanCards />
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
