const buttons = document.querySelectorAll(".game-btn");
const startBtn = document.querySelector("#start-btn");
const statusText = document.querySelector("#status");
const scoreDisplay = document.querySelector("#current-score");
const bestScoreDisplay = document.querySelector("#best-score");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}

const frequencies = [261.63, 329.63, 392.0, 523.25];

let sequence = [];
let userSequence = [];
let level = 1;
let isPlayerTurn = false;

let bestScore = localStorage.getItem("simonBestScore") || 0;
bestScoreDisplay.textContent = bestScore;

function getRandomButtonIndex() {
  return Math.floor(Math.random() * buttons.length);
}

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  level = 1;
  sequence = [];
  startNewRound();
});

function startNewRound() {
  userSequence = [];
  isPlayerTurn = false;
  scoreDisplay.textContent = level;

  statusText.textContent = "Ready...";

  setTimeout(() => {
    statusText.textContent = "Go!";
    setTimeout(() => {
      sequence.push(getRandomButtonIndex());
      playSequence(0);
    }, 1000);
  }, 1000);
}

function playSequence(index) {
  if (index >= sequence.length) {
    statusText.textContent = "Your turn!";
    isPlayerTurn = true;
    return;
  }

  const btnIndex = sequence[index];
  highlightButton(btnIndex);

  setTimeout(() => {
    playSequence(index + 1);
  }, 800);
}

function highlightButton(index) {
  buttons[index].classList.add("active");
  playTone(frequencies[index]);

  setTimeout(() => {
    buttons[index].classList.remove("active");
  }, 400);
}

function handleButtonClick(e) {
  if (!isPlayerTurn) return;

  const clickedIndex = parseInt(e.target.dataset.index);
  userSequence.push(clickedIndex);
  highlightButton(clickedIndex);

  const currentStep = userSequence.length - 1;

  if (userSequence[currentStep] !== sequence[currentStep]) {
    gameOver();
    return;
  }

  if (userSequence.length === sequence.length) {
    isPlayerTurn = false;
    level++;
    setTimeout(startNewRound, 1000);
  }
}

buttons[0].onclick = handleButtonClick;
buttons[1].onclick = handleButtonClick;
buttons[2].onclick = handleButtonClick;
buttons[3].onclick = handleButtonClick;

function gameOver() {
  statusText.textContent = `Game Over! Score: ${level}`;
  isPlayerTurn = false;
  startBtn.disabled = false;

  if (level > bestScore) {
    bestScore = level;
    localStorage.setItem("simonBestScore", bestScore);
    bestScoreDisplay.textContent = bestScore;
  }
}
