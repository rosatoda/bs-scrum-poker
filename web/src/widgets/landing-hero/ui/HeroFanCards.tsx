const FAN = [
  { value: '3', angle: -24 },
  { value: '5', angle: -12 },
  { value: '8', angle: 0 },
  { value: '13', angle: 12 },
  { value: '?', angle: 24 },
];

export function HeroFanCards() {
  return (
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
  );
}
