# Cup Order Betting Game

A simple browser game built with HTML, CSS, and JavaScript.

## How to run

Because the app uses JavaScript modules (`type="module"`), run it from a local static server:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

## Game rules

- 3 cups (`A`, `B`, `C`) are shuffled into a random order each round.
- You can place up to 3 bets per round:
  - Exact Order Bet (5×)
  - Two-Cup Order Bet (2×)
  - Single-Cup Position Bet (1.5×)
- Total stake cannot exceed your balance.
