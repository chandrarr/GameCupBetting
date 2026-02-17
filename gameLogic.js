const PAYOUTS = {
  exact: 5,
  pair: 2,
  single: 1.5,
};

const CUPS = ["A", "B", "C"];

/**
 * Core game engine with no direct DOM dependency.
 * UI calls methods on this class to place bets and resolve rounds.
 */
export class CupOrderGame {
  constructor(startBalance = 100) {
    this.balance = startBalance;
    this.round = 1;
  }

  static isValidOrder(order) {
    if (!order || order.length !== 3) return false;
    const normalized = order.toUpperCase().split("");
    return CUPS.every((cup) => normalized.includes(cup));
  }

  /** Randomly shuffles cup labels and returns an order array like ["B", "A", "C"]. */
  generateRoundOrder() {
    const order = [...CUPS];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  getTotalStake(bets) {
    return bets.exact.amount + bets.pair.amount + bets.single.amount;
  }

  validateBets(bets) {
    if (!CupOrderGame.isValidOrder(bets.exact.order)) {
      throw new Error("Exact order must be a permutation of A, B, C.");
    }

    if (!["AB", "BC", "AC"].includes(bets.pair.pair)) {
      throw new Error("Two-cup pair must be AB, BC, or AC.");
    }

    if (!["first", "second"].includes(bets.pair.prediction)) {
      throw new Error("Two-cup prediction must be first or second.");
    }

    if (!CUPS.includes(bets.single.cup)) {
      throw new Error("Single-cup bet must use cup A, B, or C.");
    }

    if (![1, 2, 3].includes(bets.single.position)) {
      throw new Error("Single-cup position must be 1, 2, or 3.");
    }

    const amounts = [bets.exact.amount, bets.pair.amount, bets.single.amount];
    if (amounts.some((amount) => Number.isNaN(amount) || amount < 0)) {
      throw new Error("Bet amounts must be non-negative numbers.");
    }

    const totalStake = this.getTotalStake(bets);
    if (totalStake <= 0) {
      throw new Error("Place at least one bet amount greater than zero.");
    }

    if (totalStake > this.balance) {
      throw new Error("Total stake exceeds your current balance.");
    }
  }

  resolveRound(bets) {
    this.validateBets(bets);

    const stake = this.getTotalStake(bets);
    this.balance -= stake;

    const order = this.generateRoundOrder();
    const positions = {
      [order[0]]: 1,
      [order[1]]: 2,
      [order[2]]: 3,
    };

    let payout = 0;

    // Exact order: full sequence must match (e.g., "ACB").
    if (bets.exact.amount > 0 && order.join("") === bets.exact.order.toUpperCase()) {
      payout += bets.exact.amount * PAYOUTS.exact;
    }

    // Pair order: determine whether first cup in pair appears before second cup.
    if (bets.pair.amount > 0) {
      const [firstCup, secondCup] = bets.pair.pair.split("");
      const firstBeforeSecond = positions[firstCup] < positions[secondCup];
      const won =
        (bets.pair.prediction === "first" && firstBeforeSecond) ||
        (bets.pair.prediction === "second" && !firstBeforeSecond);

      if (won) {
        payout += bets.pair.amount * PAYOUTS.pair;
      }
    }

    // Single-cup position: selected cup must land in the predicted slot.
    if (bets.single.amount > 0 && positions[bets.single.cup] === bets.single.position) {
      payout += bets.single.amount * PAYOUTS.single;
    }

    this.balance += payout;

    const net = payout - stake;
    const result = {
      round: this.round,
      order,
      payout,
      stake,
      net,
      balance: this.balance,
    };

    this.round += 1;
    return result;
  }
}

export { PAYOUTS };
