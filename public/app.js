const dealButton = document.getElementById('deal');
const hitButton = document.getElementById('hit');
const standButton = document.getElementById('stand');
const statusDiv = document.getElementById('status');
const playerHandDiv = document.getElementById('player-hand');
const dealerHandDiv = document.getElementById('dealer-hand');

let previousPlayerHand = [];
let previousDealerHand = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeGameUI();

  dealButton.addEventListener('click', () => {
    fetch('/deal')
      .then(response => response.json())
      .then(data => {
        previousPlayerHand = [];
        previousDealerHand = [];
        updateUI(data);
        if (!data.gameOver) {
          hitButton.disabled = false;
          standButton.disabled = false;
        }
      });
  });


  hitButton.addEventListener('click', () => {
    fetch('/hit')
      .then(response => response.json())
      .then(data => updateUI(data));
  });

  standButton.addEventListener('click', () => {
    fetch('/stand')
      .then(response => response.json())
      .then(data => {
        updateUI(data);
        hitButton.disabled = true;
        standButton.disabled = true;
      });
  });
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'd' && !dealButton.disabled) {
    dealButton.click();
  } else if (key === 'h' && !hitButton.disabled) {
    hitButton.click();
  } else if (key === 's' && !standButton.disabled) {
    standButton.click();
  }
});

function initializeGameUI() {
  statusDiv.textContent = 'Press "Deal" to start!';
  playerHandDiv.textContent = '';
  dealerHandDiv.textContent = '';
  hitButton.disabled = true;
  standButton.disabled = true;
}

function updateUI(data) {
  statusDiv.textContent = data.status;

  // Calculate which player cards to highlight
  let playerNewCards = [];
  if (data.playerHand.length > previousPlayerHand.length) {
    playerNewCards = [data.playerHand[data.playerHand.length - 1]];
  }

  // Calculate which dealer cards to highlight
  let dealerNewCards = [];
  if (data.dealerHand.length > previousDealerHand.length) {
    dealerNewCards = [data.dealerHand[data.dealerHand.length - 1]];
  }

  // Determine winner for crown emoji
  let playerCrown = '';
  let dealerCrown = '';
  const statusLower = data.status.toLowerCase();
  if (statusLower.includes('player wins')) {
    playerCrown = '👑 ';
  } else if (statusLower.includes('dealer wins')) {
    dealerCrown = '👑 ';
  }

  // Player Hand
  playerHandDiv.innerHTML = playerCrown + 'Player Hand: ' +
    renderHand(data.playerHand, playerNewCards) +
    ` (Value: ${data.playerValue})`;

  // Dealer Hand
  dealerHandDiv.innerHTML = dealerCrown + 'Dealer Hand: ' +
    renderHand(data.dealerHand, dealerNewCards) +
    ` (Value: ${data.dealerValue})`;

  playerHandDiv.classList.add('visible');
  dealerHandDiv.classList.add('visible');

  // Update stored hands
  previousPlayerHand = [...data.playerHand];
  previousDealerHand = [...data.dealerHand];

  if (data.gameOver) {
    hitButton.disabled = true;
    standButton.disabled = true;
  }
}

function getNewCards(prevHand, newHand) {
  const prevLength = prevHand.length;
  return newHand.slice(prevLength);
}

function renderHand(hand, newCards) {
  return hand
    .map(c => {
      const isNew = newCards.includes(c);
      const highlightClass = isNew ? 'updated' : '';
      return `<span class="card ${highlightClass}">${c.rank}${c.suit}</span>`;
    })
    .join(' ');
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (let card of hand) {
    if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10;
    } else if (card.rank === 'A') {
      aces += 1;
      value += 11;
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