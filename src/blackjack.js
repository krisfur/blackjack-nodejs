class BlackjackGame {
  constructor(state = null) {
    if (state) {
      this.deck = Array.isArray(state.deck) ? state.deck.map(card => ({ ...card })) : [];
      this.playerHand = Array.isArray(state.playerHand) ? state.playerHand.map(card => ({ ...card })) : [];
      this.dealerHand = Array.isArray(state.dealerHand) ? state.dealerHand.map(card => ({ ...card })) : [];
    } else {
      this.deck = this.createDeck();
      this.shuffleDeck();
      this.playerHand = [];
      this.dealerHand = [];
    }
  }

  exportState() {
    return {
      deck: this.deck.map(card => ({ ...card })),
      playerHand: this.playerHand.map(card => ({ ...card })),
      dealerHand: this.dealerHand.map(card => ({ ...card }))
    };
  }

  createDeck() {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCard(hand) {
    if (this.deck.length === 0) {
      this.deck = this.createDeck();
      this.shuffleDeck();
    }
    const card = this.deck.pop();
    hand.push(card);
  }

  calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
      if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else if (card.rank === 'A') {
        value += 11;
        aces += 1;
      } else {
        value += parseInt(card.rank);
      }
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    return value;
  }
}

module.exports = BlackjackGame;