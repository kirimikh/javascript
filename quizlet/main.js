let allCards = JSON.parse(localStorage.getItem("flashcards_app_data")) || {};
let currentDeckName = "";

const ui = {
  deckNameInput: document.getElementById("deck-name"),
  createDeckBtn: document.getElementById("create-deck"),
  addDeckBtn: document.getElementById("add-deck"),
  cancelDeckBtn: document.getElementById("cancel-deck-input"),
  deckNameContainer: document.getElementById("deck-name-input"),
  decksScreen: document.getElementById("decks"),
  decksList: document.getElementById("decks-list"),

  flashcardsScreen: document.getElementById("flashcards"),
  backToDecksBtn: document.getElementById("back-to-decks"),
  createCardBtn: document.getElementById("add-card"),
  cardInputContainer: document.getElementById("card-name-input"),
  questionInput: document.getElementById("question"),
  answerInput: document.getElementById("answer"),
  addCardBtn: document.getElementById("add"),
  backToCardsBtn: document.getElementById("back-to-cards"),
  cardsList: document.getElementById("cards-list"),

  studyContainer: document.getElementById("study-container"),
  studyCardRender: document.getElementById("study-card-render"),
  studyModeBtn: document.getElementById("study-mode-btn"),
  nextRandomCardBtn: document.getElementById("next-random-card"),
  exitStudyBtn: document.getElementById("exit-study"),

  toastContainer: document.getElementById("toast-container"),
  confirmBox: document.getElementById("custom-confirm"),
  confirmYes: document.getElementById("confirm-yes"),
  confirmNo: document.getElementById("confirm-no"),
  confirmMsg: document.getElementById("confirm-message"),
};

function save() {
  localStorage.setItem("flashcards_app_data", JSON.stringify(allCards));
}

function showToast(message) {
  ui.toastContainer.innerHTML = `<div class="toast">${message}</div>`;
  setTimeout(() => (ui.toastContainer.innerHTML = ""), 3000);
}

function askConfirmation(message, onConfirm) {
  ui.confirmMsg.innerHTML = message;
  ui.confirmBox.classList.remove("hidden");
  ui.confirmYes.onclick = () => {
    onConfirm();
    ui.confirmBox.classList.add("hidden");
  };
  ui.confirmNo.onclick = () => ui.confirmBox.classList.add("hidden");
}

ui.addDeckBtn.addEventListener("click", () => {
  ui.deckNameContainer.classList.remove("hidden");
  ui.decksScreen.classList.add("hidden");
});

ui.createDeckBtn.addEventListener("click", () => {
  const name = ui.deckNameInput.value.trim();
  if (!name) return showToast("Введите название!");
  if (allCards[name]) return showToast("Колода уже есть!");

  allCards[name] = [];
  save();
  ui.deckNameInput.value = "";
  renderDecks();
  ui.deckNameContainer.classList.add("hidden");
  ui.decksScreen.classList.remove("hidden");
});

ui.cancelDeckBtn.addEventListener("click", () => {
  ui.deckNameContainer.classList.add("hidden");
  ui.decksScreen.classList.remove("hidden");
});

function renderDecks() {
  const deckNames = Object.keys(allCards);
  ui.decksList.innerHTML = deckNames
    .map(
      (name) => `
    <div class="deck-container" onclick="openDeck('${name}')">
      <span class="deck-title">${name}</span>
      <button class="delete-deck-btn" onclick="event.stopPropagation(); deleteDeck('${name}')">&times;</button>
    </div>
  `,
    )
    .join("");
}

function openDeck(name) {
  currentDeckName = name;
  ui.decksScreen.classList.add("hidden");
  ui.flashcardsScreen.classList.remove("hidden");
  ui.backToCardsBtn.classList.add("hidden");
  ui.backToDecksBtn.classList.remove("hidden");

  if (allCards[name].length === 0) {
    ui.cardInputContainer.classList.remove("hidden");
    ui.cardsList.classList.add("hidden");
    ui.studyModeBtn.classList.add("hidden");
    ui.createCardBtn.classList.add("hidden");
  } else {
    ui.cardInputContainer.classList.add("hidden");
    renderCards();
  }
}

function deleteDeck(name) {
  askConfirmation(`Удалить колоду "${name}"?`, () => {
    delete allCards[name];
    save();
    renderDecks();
    showToast("Колода удалена");
  });
}

ui.addCardBtn.addEventListener("click", () => {
  const q = ui.questionInput.value.trim();
  const a = ui.answerInput.value.trim();
  if (!q || !a) return showToast("Заполни поля!");

  allCards[currentDeckName].push({ question: q, answer: a, learned: false });
  save();

  ui.questionInput.value = "";
  ui.answerInput.value = "";
  ui.cardInputContainer.classList.add("hidden");
  ui.backToCardsBtn.classList.add("hidden");
  ui.backToDecksBtn.classList.remove("hidden");
  renderCards();
});

function renderCards() {
  ui.cardsList.classList.remove("hidden");
  ui.createCardBtn.classList.remove("hidden");
  ui.studyModeBtn.classList.toggle(
    "hidden",
    allCards[currentDeckName].length === 0,
  );

  ui.cardsList.innerHTML = allCards[currentDeckName]
    .map(
      (card, idx) => `
    <div class="card-scene">
      <div class="card-inner" onclick="this.classList.toggle('is-flipped')">
        <div class="card-face card-front">
          <p>${card.question}</p>
          <div class="card-controls">
            <button class="edit-btn" onclick="event.stopPropagation(); startEdit(${idx})">✎</button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteCard(${idx})">×</button>
          </div>
          ${card.learned ? '<span class="status-badge">Выучено ✅</span>' : ""}
        </div>
        <div class="card-face card-back">
          <p>${card.answer}</p>
          ${card.learned ? `<button class="reset-btn" onclick="event.stopPropagation(); unlearnCard(${idx})">Сбросить ↺</button>` : ""}
        </div>
      </div>
    </div>`,
    )
    .join("");
}

ui.createCardBtn.addEventListener("click", () => {
  ui.questionInput.value = "";
  ui.answerInput.value = "";
  ui.cardsList.classList.add("hidden");
  ui.createCardBtn.classList.add("hidden");
  ui.backToDecksBtn.classList.add("hidden");
  ui.studyModeBtn.classList.add("hidden");
  ui.cardInputContainer.classList.remove("hidden");
  ui.backToCardsBtn.classList.remove("hidden");
});

function deleteCard(idx) {
  askConfirmation("Удалить карту?", () => {
    allCards[currentDeckName].splice(idx, 1);
    save();
    renderCards();
  });
}

function unlearnCard(idx) {
  allCards[currentDeckName][idx].learned = false;
  save();
  renderCards();
}

function startEdit(idx) {
  const card = allCards[currentDeckName][idx];
  ui.questionInput.value = card.question;
  ui.answerInput.value = card.answer;
  ui.cardsList.classList.add("hidden");
  ui.createCardBtn.classList.add("hidden");
  ui.cardInputContainer.classList.remove("hidden");
  ui.backToCardsBtn.classList.remove("hidden");

  allCards[currentDeckName].splice(idx, 1);
  save();
}

ui.studyModeBtn.addEventListener("click", () => {
  ui.flashcardsScreen.classList.add("hidden");
  ui.studyContainer.classList.remove("hidden");
  showRandomCard();
});

function showRandomCard() {
  const unlearned = allCards[currentDeckName].filter((c) => !c.learned);
  if (unlearned.length === 0) {
    ui.studyCardRender.innerHTML = `<h3>Всё выучено! 🎉</h3>`;
    ui.nextRandomCardBtn.classList.add("hidden");
    return;
  }
  ui.nextRandomCardBtn.classList.remove("hidden");
  const card = unlearned[Math.floor(Math.random() * unlearned.length)];
  ui.studyCardRender.innerHTML = `
    <div class="card-scene study-card">
      <div class="card-inner" onclick="this.classList.toggle('is-flipped')">
        <div class="card-face card-front"><b>Вопрос:</b><p>${card.question}</p></div>
        <div class="card-face card-back">
          <b>Ответ:</b><p>${card.answer}</p>
          <button class="learned-btn" onclick="markAsLearned('${card.question.replace(/'/g, "\\'")}')">Выучил ✅</button>
        </div>
      </div>
    </div>`;
}

function markAsLearned(question) {
  const card = allCards[currentDeckName].find((c) => c.question === question);
  if (card) {
    card.learned = true;
    save();
    renderCards();
    showRandomCard();
  }
}

ui.backToDecksBtn.addEventListener("click", () => {
  ui.flashcardsScreen.classList.add("hidden");
  ui.decksScreen.classList.remove("hidden");
  ui.cardInputContainer.classList.add("hidden");
  renderDecks();
});

ui.backToCardsBtn.addEventListener("click", () => {
  ui.cardInputContainer.classList.add("hidden");
  ui.backToCardsBtn.classList.add("hidden");
  ui.flashcardsScreen.classList.remove("hidden");
  ui.backToDecksBtn.classList.remove("hidden");
  renderCards();
});

ui.nextRandomCardBtn.addEventListener("click", showRandomCard);
ui.exitStudyBtn.addEventListener("click", () => {
  ui.studyContainer.classList.add("hidden");
  ui.flashcardsScreen.classList.remove("hidden");
  renderCards();
});

renderDecks();
