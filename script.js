const menuContainer = document.getElementById('menu-container');
const difficultyContainer = document.getElementById('difficulty-container');
const gameContainer = document.getElementById('game-container');
const shopContainer = document.getElementById('shop-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const savedScoreElement = document.getElementById('saved-score');

let score = 0;
let savedScore = 0;
let lives = 3;
let level = 1;
let playerSpeed = 10;
let asteroidSpeed = 3;
let spawnRate = 1000;
let bulletSpeed = 10;
let doubleBullets = false;
let homingBullets = false;
let goldenBulletChance = 0.001;
let isGameOver = false;

function openDifficultyMenu() {
  menuContainer.classList.remove('active');
  difficultyContainer.classList.add('active');
}

function openShop() {
  menuContainer.classList.remove('active');
  shopContainer.classList.add('active');
}

function openSettings() {
  alert('Settings are not implemented yet.');
}

function returnToMenu() {
  difficultyContainer.classList.remove('active');
  shopContainer.classList.remove('active');
  menuContainer.classList.add('active');
}

function startGame(difficulty) {
  difficultyContainer.classList.remove('active');
  gameContainer.classList.add('active');
  initializeGame(difficulty);
}

function initializeGame(difficulty) {
  score = 0;
  lives = 3;
  level = 1;
  isGameOver = false;

  updateUI();

  switch (difficulty) {
    case 'easy':
      asteroidSpeed = 2;
      spawnRate = 1500;
      break;
    case 'normal':
      asteroidSpeed = 3;
      spawnRate = 1000;
      break;
    case 'hard':
      asteroidSpeed = 5;
      spawnRate = 700;
      break;
  }

  document.addEventListener('keydown', handleKeyDown);
  startGameLoop();
}

function updateUI() {
  scoreElement.textContent = `Score: ${score}`;
  livesElement.textContent = `Lives: ${lives}`;
  levelElement.textContent = `Level: ${level}`;
}

function handleKeyDown(e) {
  if (e.key === 'ArrowLeft') {
    movePlayer('left');
  } else if (e.key === 'ArrowRight') {
    movePlayer('right');
  } else if (e.key === ' ') {
    shootBullet();
  }
}

function movePlayer(direction) {
  const playerRect = player.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  if (direction === 'left' && playerRect.left > containerRect.left) {
    player.style.left = `${player.offsetLeft - playerSpeed}px`;
  } else if (direction === 'right' && playerRect.right < containerRect.right) {
    player.style.left = `${player.offsetLeft + playerSpeed}px`;
  }
}

function shootBullet() {
  const createBullet = (isGolden) => {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    if (isGolden) bullet.classList.add('golden-bullet');
    bullet.style.left = `${player.offsetLeft + 21}px`;
    bullet.style.top = `${player.offsetTop}px`;
    gameContainer.appendChild(bullet);

    const interval = setInterval(() => {
      bullet.style.top = `${bullet.offsetTop - bulletSpeed}px`;

      const asteroids = document.querySelectorAll('.asteroid');
      asteroids.forEach((asteroid) => {
        if (isCollision(bullet, asteroid)) {
          asteroid.remove();
          bullet.remove();
          clearInterval(interval);
          score++;
          scoreElement.textContent = `Score: ${score}`;

          if (isGolden) {
            const nearbyAsteroids = [...document.querySelectorAll('.asteroid')].slice(0, 5);
            nearbyAsteroids.forEach((nearAsteroid) => nearAsteroid.remove());
          }
        }
      });

      if (bullet.offsetTop < 0) {
        clearInterval(interval);
        bullet.remove();
      }
    }, 20);
  };

  if (doubleBullets) {
    createBullet(Math.random() < goldenBulletChance);
    createBullet(Math.random() < goldenBulletChance);
  } else {
    createBullet(Math.random() < goldenBulletChance);
  }
}

function startGameLoop() {
  setInterval(() => {
    if (!isGameOver) {
      spawnAsteroid();
    }
  }, spawnRate);
}

function spawnAsteroid() {
  const asteroid = document.createElement('div');
  asteroid.classList.add('asteroid');
  asteroid.style.left = `${Math.random() * (gameContainer.offsetWidth - 50)}px`;
  asteroid.style.top = '0px';
  gameContainer.appendChild(asteroid);

  const interval = setInterval(() => {
    asteroid.style.top = `${asteroid.offsetTop + asteroidSpeed}px`;

    if (isCollision(asteroid, player)) {
      asteroid.remove();
      loseLife();
      clearInterval(interval);
    }

    if (asteroid.offsetTop > gameContainer.offsetHeight) {
      clearInterval(interval);
      asteroid.remove();
    }
  }, 20);
}

function loseLife() {
  lives--;
  updateUI();
  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  isGameOver = true;
  alert(`Game over! Your score: ${score}`);
  saveScore();
  resetGame();
}

function saveScore() {
  const savedScore = parseInt(savedScoreElement.textContent, 10) || 0;
  if (score > savedScore) {
    savedScoreElement.textContent = score;
  }
}

function resetGame() {
  gameContainer.classList.remove('active');
  menuContainer.classList.add('active');
}

function isCollision(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();

  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

function buyUpgrade(upgrade) {
  const currentScore = parseInt(savedScoreElement.textContent, 10) || 0;

  switch (upgrade) {
    case 'doubleBullets':
      if (currentScore >= 50) {
        doubleBullets = true;
        savedScoreElement.textContent = currentScore - 50;
        alert('Now you shoot double bullets!');
      } else {
        alert('Not enough points to purchase.');
      }
      break;
    case 'homingBullets':
      if (currentScore >= 150) {
        homingBullets = true;
        savedScoreElement.textContent = currentScore - 150;
        alert('Now your bullets are homing!');
      } else {
        alert('Not enough points to purchase.');
      }
      break;
    case 'doubleSpeed':
      if (currentScore >= 25) {
        playerSpeed *= 2;
        savedScoreElement.textContent = currentScore - 25;
        alert('Now you move 2x faster!');
      } else {
        alert('Not enough points to purchase.');
      }
      break;
    case 'goldenBullet':
      if (currentScore >= 333) {
        goldenBulletChance = 0.1;
        savedScoreElement.textContent = currentScore - 333;
        alert('You have unlocked the golden bullet!');
      } else {
        alert('Not enough points to purchase.');
      }
      break;
    default:
      alert('Unknown upgrade.');
      break;
  }
}