# ♠ Scrum Poker Online

Free, real-time planning poker for agile teams — inspired by scrumpoker-online.org. Open a table, share an 8-digit room link (e.g. `/room/56201720`), pick cards face-down, and reveal them all at once.

**Stack:** Next.js 14 (App Router, TypeScript) · NestJS 10 + Socket.IO · no database (rooms live in memory)

## Features

- Create a room with one click — 8-digit room codes and shareable invite links
- Real-time voting over WebSockets: everyone sees who has a card down, but values stay hidden server-side until reveal
- Fibonacci deck: `0 ½ 1 2 3 5 8 13 20 40 100 ? ☕`
- Reveal all cards at once with a 3D flip, see the average, votes cast, and consensus
- Start the next round with cleared votes and a round counter
- Spectator mode, tap-again to retract a vote, remembered player name
- No accounts, no database — empty rooms are purged automatically

## Repository layout

```
scrum-poker/
├── web/       Next.js frontend (port 3000)
├── server/    NestJS + Socket.IO backend (port 3001)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Run locally

Requires Node.js 20+.

```bash
# terminal 1 — backend
cd server
npm install
npm run start:dev        # http://localhost:3001

# terminal 2 — frontend
cd web
npm install
npm run dev              # http://localhost:3000
```

Open http://localhost:3000, start a game, then open the invite link in a second browser window to see the realtime sync.

Or with Docker:

```bash
docker compose up --build
```

## Configuration

| App    | Variable                 | Default                 | Purpose                          |
| ------ | ------------------------ | ----------------------- | -------------------------------- |
| web    | `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | URL of the backend               |
| server | `PORT`                   | `3001`                  | HTTP/WebSocket port              |
| server | `FRONTEND_URL`           | `*`                     | Allowed CORS origins (comma-sep) |

Copy `web/.env.example` to `web/.env.local` and `server/.env.example` to `server/.env` to customize.

## Deploy

The frontend and backend deploy separately (the backend holds live WebSocket connections, so it needs a long-running host — not serverless).

**Backend → Render / Railway / Fly.io (free tiers work):**

1. Create a new Web Service from your GitHub repo, root directory `server`.
2. Build command `npm install && npm run build`, start command `npm run start:prod`.
3. Set `FRONTEND_URL` to your deployed frontend URL once you have it.
4. Note the service URL, e.g. `https://scrum-poker-server.onrender.com`.

**Frontend → Vercel:**

1. Import the repo in Vercel, set the root directory to `web`.
2. Add env var `NEXT_PUBLIC_SOCKET_URL` = your backend URL from the step above.
3. Deploy. Update the backend's `FRONTEND_URL` with the Vercel URL to lock down CORS.

Any Docker host also works — both apps ship with a `Dockerfile`.

## How the realtime protocol works

Clients talk to a single Socket.IO gateway:

| Event (client → server) | Payload                     | Effect                            |
| ----------------------- | --------------------------- | --------------------------------- |
| `room:join`             | `{ roomId, name, spectator }` | Join (and lazily create) a room |
| `room:vote`             | `{ value }`                 | Cast a card; same value retracts  |
| `room:reveal`           | —                           | Flip all cards for the room       |
| `room:reset`            | —                           | Clear votes, next round           |
| `room:spectator`        | `{ spectator }`             | Toggle spectator mode             |
| `room:rename`           | `{ name }`                  | Change display name               |

The server broadcasts `room:state` after every change. Vote values are stripped from the payload until the room is revealed, so hidden votes can't be sniffed from network traffic.

## License

MIT
