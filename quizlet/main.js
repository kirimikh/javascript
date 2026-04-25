let deck = JSON.parse(localStorage.getItem("flashcards-deck") || "[]");
let currentIndex = 0;
let isFlipped = false;

setInterval(() => {
  localStorage.setItem("flashcards-deck", JSON.stringify(deck));
}, 5000);

const addCard = () => {
  const fInput = document.getElementById("frontText");
  const bInput = document.getElementById("backText");

  if (fInput.value.trim() && bInput.value.trim()) {
    const newCard = {
      id: Date.now(),
      front: fInput.value,
      back: bInput.value,
      learned: false,
    };
    deck.push(newCard);
    fInput.value = "";
    bInput.value = "";
    render();
  }
};

const deleteCard = (id) => {
  deck = deck.filter((card) => card.id !== id);
  render();
};

const editCard = (id) => {
  const target = deck.find((c) => c.id === id);
  document.getElementById("frontText").value = target.front;
  document.getElementById("backText").value = target.back;
  deleteCard(id);
};

const toggleLearned = (id) => {
  deck = deck.map((c) => (c.id === id ? { ...c, learned: !c.learned } : c));
  render();
};

const shuffle = () => {
  deck.sort(() => Math.random() - 0.5);
  render();
};

const render = () => {
  const tableBody = document.getElementById("tableBody");
  const isOnlyUnlearned = document.getElementById("onlyNewFilter").checked;

  const studyList = isOnlyUnlearned ? deck.filter((c) => !c.learned) : deck;

  tableBody.innerHTML = deck
    .map(
      (card) => `
        <tr>
            <td>${card.front}</td>
            <td>${card.back}</td>
            <td>
                <input type="checkbox" ${card.learned ? "checked" : ""} 
                    onclick="toggleLearned(${card.id})">
                <span class="${card.learned ? "learned" : ""}">${card.learned ? "Да" : "Нет"}</span>
            </td>
            <td>
                <button onclick="editCard(${card.id})">✎</button>
                <button onclick="deleteCard(${card.id})" style="background:#dc3545">✖</button>
            </td>
        </tr>
    `,
    )
    .join("");

  const display = document.getElementById("cardDisplay");
  const posInfo = document.getElementById("posInfo");

  if (studyList.length === 0) {
    display.innerText = "Пусто...";
    posInfo.innerText = "0 / 0";
  } else {
    if (currentIndex >= studyList.length) currentIndex = 0;
    const currentCard = studyList[currentIndex];
    display.innerText = isFlipped ? currentCard.back : currentCard.front;
    posInfo.innerText = `${currentIndex + 1} / ${studyList.length}`;
  }

  document.getElementById("prevBtn").disabled = currentIndex === 0;
  document.getElementById("nextBtn").disabled =
    currentIndex >= studyList.length - 1 || studyList.length === 0;
};

document.getElementById("addBtn").onclick = addCard;
document.getElementById("shuffleBtn").onclick = shuffle;
document.getElementById("onlyNewFilter").onchange = () => {
  currentIndex = 0;
  render();
};
document.getElementById("cardDisplay").onclick = () => {
  isFlipped = !isFlipped;
  render();
};
document.getElementById("prevBtn").onclick = () => {
  currentIndex--;
  isFlipped = false;
  render();
};
document.getElementById("nextBtn").onclick = () => {
  currentIndex++;
  isFlipped = false;
  render();
};

render();
