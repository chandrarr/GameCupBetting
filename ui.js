import { CupOrderGame, PAYOUTS } from "./gameLogic.js";

const game = new CupOrderGame(100);

const balanceEl = document.getElementById("balance");
const roundEl = document.getElementById("round");
const cupRowEl = document.getElementById("cupRow");
const activeBetsEl = document.getElementById("activeBets");
const resultTextEl = document.getElementById("resultText");
const payoutTextEl = document.getElementById("payoutText");

const exactOrderInput = document.getElementById("exactOrder");
const exactAmountInput = document.getElementById("exactAmount");

const pairSelect = document.getElementById("pairSelect");
const pairPrediction = document.getElementById("pairPrediction");
const pairAmountInput = document.getElementById("pairAmount");

const singleCup = document.getElementById("singleCup");
const singlePosition = document.getElementById("singlePosition");
const singleAmountInput = document.getElementById("singleAmount");

const drawBtn = document.getElementById("drawBtn");

const money = (value) => `$${value.toFixed(2)}`;

function refreshHeader() {
  balanceEl.textContent = money(game.balance);
  roundEl.textContent = String(game.round);
}

function renderCups(order) {
  cupRowEl.innerHTML = "";
  order.forEach((cup, index) => {
    const el = document.createElement("div");
    el.className = "cup";
    el.textContent = `${index + 1}: ${cup}`;
    cupRowEl.appendChild(el);
  });
}

function collectBets() {
  return {
    exact: {
      order: exactOrderInput.value.trim().toUpperCase(),
      amount: Number(exactAmountInput.value),
    },
    pair: {
      pair: pairSelect.value,
      prediction: pairPrediction.value,
      amount: Number(pairAmountInput.value),
    },
    single: {
      cup: singleCup.value,
      position: Number(singlePosition.value),
      amount: Number(singleAmountInput.value),
    },
  };
}

function renderBetSummary(bets) {
  const pairDirection =
    bets.pair.prediction === "first"
      ? `${bets.pair.pair[0]} before ${bets.pair.pair[1]}`
      : `${bets.pair.pair[1]} before ${bets.pair.pair[0]}`;

  activeBetsEl.innerHTML = `
    <p class="bet-summary">Exact (${PAYOUTS.exact}×): ${bets.exact.order} — ${money(
      bets.exact.amount,
    )}</p>
    <p class="bet-summary">Two-Cup (${PAYOUTS.pair}×): ${pairDirection} — ${money(
      bets.pair.amount,
    )}</p>
    <p class="bet-summary">Single (${PAYOUTS.single}×): ${bets.single.cup} in position ${
      bets.single.position
    } — ${money(bets.single.amount)}</p>
  `;
}

/**
 * Main click handler:
 * 1) Read current form values
 * 2) Ask logic module to validate and resolve round
 * 3) Update UI with generated order and payout
 */
drawBtn.addEventListener("click", () => {
  try {
    const bets = collectBets();
    renderBetSummary(bets);

    const result = game.resolveRound(bets);
    renderCups(result.order);
    refreshHeader();

    resultTextEl.textContent = `Round ${result.round}: order is ${result.order.join(", ")}. Stake ${money(
      result.stake,
    )}, payout ${money(result.payout)}.`;
    payoutTextEl.textContent = `Net: ${money(result.net)} | New balance: ${money(
      result.balance,
    )}`;
  } catch (error) {
    resultTextEl.textContent = error.message;
    payoutTextEl.textContent = "";
  }
});

refreshHeader();
