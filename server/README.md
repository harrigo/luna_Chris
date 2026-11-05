# Luna Chris multiplayer relay

A tiny WebSocket server (Node + `ws`). Players join a room by name and stream their state; the server sends each
room one snapshot of everyone who moved, 60 times a second. Up to 4 players per room (`MAX_PLAYERS`).

## Run it

```sh
cd server
npm install
npm start                 # listens on :8787 (PORT=... to change). GET / = health check
```

or with Docker:

```sh
docker build -t luna-chris-relay server
docker run -d --restart unless-stopped -p 8787:8787 luna-chris-relay
```

## Point the game at it

The game is served over **https** (GitHub Pages), so browsers will only connect to a **wss://** address: put the
relay behind a reverse proxy with a certificate (Caddy / Nginx Proxy Manager / Traefik / a Cloudflare tunnel) that
forwards WebSocket upgrades to port 8787, e.g. `wss://mp.example.com`.

Then open the game with:

```
https://harrigo.github.io/luna_Chris/?mp=wss://mp.example.com&room=friday&name=harri
```

Everyone using the same `room` sees each other on the same planet. The settings are remembered on the device;
`?mp=off` turns it off. For testing on your own network with a local copy of the game over http: `?mp=local`
(= ws://<same host>:8787).

## What's synced so far (step 1)

Each player's Chris: level, position round the planet, height, run/jump speed, facing, aim angle, duck, jetpack,
firing, powered-up and weapon. Others are drawn 100 ms in the past and interpolated between snapshots. Each player
still has their own enemies, pickups and boss; sharing those (one player hosts the level) is the next step.
