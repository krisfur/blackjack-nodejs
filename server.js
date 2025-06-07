const express = require('express');
const session = require('express-session');
const BlackjackGame = require('./src/blackjack');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Route: /deal
app.get('/deal', (req, res) => {
  const game = new BlackjackGame();
  game.dealCard(game.playerHand);
  game.dealCard(game.playerHand);
  game.dealCard(game.dealerHand);

  const playerValue = game.calculateHandValue(game.playerHand);
  const dealerValue = game.calculateHandValue(game.dealerHand);

  let status = 'Game started';
  let gameOver = false;

  if (playerValue === 21) {
    status = 'Blackjack! Player wins!';
    gameOver = true;
  }

  req.session.game = game.exportState();

    // Uncomment for debugging
//   console.log('DEAL route:');
//   console.log('Deck:', game.deck);
//   console.log('Player Hand:', game.playerHand);
//   console.log('Dealer Hand:', game.dealerHand);

  res.json({
    status,
    playerHand: game.playerHand,
    dealerHand: game.dealerHand,
    playerValue,
    dealerValue,
    gameOver
  });
});

// Route: /hit
app.get('/hit', (req, res) => {
  if (!req.session.game) {
    return res.status(400).json({ status: 'No game in progress' });
  }

  const game = new BlackjackGame(req.session.game);
  game.dealCard(game.playerHand);
  const playerValue = game.calculateHandValue(game.playerHand);

  let status = `Player hand value: ${playerValue}`;
  let gameOver = false;

  if (playerValue > 21) {
    status = 'Player busts! Dealer wins.';
    gameOver = true;
  } else if (playerValue === 21) {
    status = 'Blackjack! Player wins!';
    gameOver = true;
  }

  req.session.game = game.exportState();

    // Uncomment for debugging
//   console.log('HIT route:');
//   console.log('Deck:', game.deck);
//   console.log('Player Hand:', game.playerHand);
//   console.log('Dealer Hand:', game.dealerHand);

  res.json({
    status,
    playerHand: game.playerHand,
    dealerHand: game.dealerHand,
    playerValue,
    dealerValue: game.calculateHandValue(game.dealerHand),
    gameOver
  });
});

// Route: /stand
app.get('/stand', (req, res) => {
  if (!req.session.game) {
    return res.status(400).json({ status: 'No game in progress' });
  }

  const game = new BlackjackGame(req.session.game);

  while (game.calculateHandValue(game.dealerHand) < 17) {
    game.dealCard(game.dealerHand);
  }

  const playerValue = game.calculateHandValue(game.playerHand);
  const dealerValue = game.calculateHandValue(game.dealerHand);

  let status = `Player: ${playerValue} | Dealer: ${dealerValue}`;
  let gameOver = true;

  if (dealerValue > 21 || playerValue > dealerValue) {
    status += ' — Player wins!';
  } else if (playerValue < dealerValue) {
    status += ' — Dealer wins!';
  } else {
    status += ' — Tie!';
  }

  req.session.game = game.exportState();

  // Unocomment for debugging
  //console.log('STAND route:');
  //console.log('Deck:', game.deck);
  //console.log('Player Hand:', game.playerHand);
  //console.log('Dealer Hand:', game.dealerHand);

  res.json({
    status,
    playerHand: game.playerHand,
    dealerHand: game.dealerHand,
    playerValue,
    dealerValue,
    gameOver
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});