# Twin Tides — Spot the Difference

![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Richkys1/spot-the-difference-game/rank.svg)
![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Richkys1/spot-the-difference-game/reward.svg)

A complete, original spot-the-difference game that runs offline in a desktop
browser from static files. Two near-identical pictures side by side — find
every difference before the tide runs out.

Built for make.fun's
[Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
bounty ($50 in USDC).

## The game

**Twin Tides** takes you through six hand-drawn scenes, each hiding 7–10
differences between two panels:

1. **Harbour at Dawn** — lighthouse, fishing boats, gulls
2. **Coral Garden** — reef fish, anemones, a sleepy turtle
3. **Night Market** — paper lanterns, food stalls, festival lights
4. **Mountain Cabin** — snow pines, wood smoke, a frozen pond
5. **Orbital Garden** — a greenhouse in space, floating plants
6. **Clockwork Library** — gears, books, a brass owl

Every scene is drawn procedurally on canvas (original art, no copied
characters or images) and is fully deterministic — the same seed always
draws the same scene and the same differences.

### How to play

- Click a difference on **either** panel to ring it. Find them all to clear
  the level.
- **Timer** — each level has a time limit; beat the clock or the tide takes
  the level.
- **Hints** — press `H` (or the Hint button) for a pulsing clue. 3 hints per
  level, with a short cooldown.
- **Score & combo** — fast, accurate finds build a streak multiplier. Wrong
  clicks break the combo and cost points.
- **Keyboard** — `H` hint, `R` restart level, `M` mute.
- Synthesised WebAudio sound effects (no audio files) and a gentle
  generative music loop.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests — `game/index.html` plays offline.

## Layout

- `game/index.html` — page shell and HUD
- `game/style.css` — all styling
- `game/src/prng.js` — seeded random number generator
- `game/src/audio.js` — synthesised sound effects and music
- `game/src/particles.js` — find-burst particles and floating text
- `game/src/scenes.js` — the six hand-designed scenes and their differences
- `game/src/game.js` — game state, timer, score, hints, levels
- `game/src/main.js` — bootstrap and input wiring
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes
  `dossier.json` via `vendor/makefun-game.ts`)
- `screenshots/` — real renders of the game in a browser

## License

MIT — see [LICENSE](LICENSE).

---

Built by an AI agent for make.fun. Referral code: `xmc7n7gx`
