import React, { Component } from "react";
import "./App.css";

class FlashcardApp extends Component {
  constructor(props) {
    super(props);

    const savedDecks = JSON.parse(
      localStorage.getItem("flashcards-decks") || "{}",
    );
    const savedCurrentDeckName =
      localStorage.getItem("flashcards-current-deck") || "Default";

    this.state = {
      decks: savedDecks,
      currentDeckName: savedCurrentDeckName,
      frontText: "",
      backText: "",
      currentIndex: 0,
      showBack: false,
      studyOnlyUnlearned: false,
      newDeckName: "",
    };

    this.saveTimer = null;
  }

  componentDidMount() {
    this.saveTimer = setInterval(() => {
      localStorage.setItem(
        "flashcards-decks",
        JSON.stringify(this.state.decks),
      );
      localStorage.setItem(
        "flashcards-current-deck",
        this.state.currentDeckName,
      );
      console.log("Progress saved automatically");
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.saveTimer);
  }

  getCurrentDeck = () => {
    return this.state.decks[this.state.currentDeckName] || [];
  };

  updateCurrentDeck = (newCards) => {
    this.setState((prevState) => ({
      decks: {
        ...prevState.decks,
        [prevState.currentDeckName]: newCards,
      },
    }));
  };

  addNewDeck = () => {
    const { newDeckName, decks } = this.state;
    if (newDeckName.trim() && !decks[newDeckName]) {
      this.setState((prevState) => ({
        decks: { ...prevState.decks, [newDeckName]: [] },
        currentDeckName: newDeckName,
        newDeckName: "",
        currentIndex: 0,
      }));
    }
  };

  addCard = (e) => {
    e.preventDefault();
    const { frontText, backText } = this.state;
    if (!frontText.trim() || !backText.trim()) return;

    const newCard = {
      id: Date.now(),
      front: frontText,
      back: backText,
      learned: false,
    };

    const updatedCards = [...this.getCurrentDeck(), newCard];
    this.updateCurrentDeck(updatedCards);
    this.setState({ frontText: "", backText: "" });
  };

  deleteCard = (id) => {
    const updatedCards = this.getCurrentDeck().filter((c) => c.id !== id);
    this.updateCurrentDeck(updatedCards);
    if (this.state.currentIndex >= updatedCards.length) {
      this.setState({ currentIndex: Math.max(0, updatedCards.length - 1) });
    }
  };

  editCard = (card) => {
    this.setState({
      frontText: card.front,
      backText: card.back,
    });
    this.deleteCard(card.id);
  };

  toggleLearned = (id) => {
    const updatedCards = this.getCurrentDeck().map((c) =>
      c.id === id ? { ...c, learned: !c.learned } : c,
    );
    this.updateCurrentDeck(updatedCards);
  };

  shuffleDeck = () => {
    const shuffled = [...this.getCurrentDeck()].sort(() => Math.random() - 0.5);
    this.updateCurrentDeck(shuffled);
    this.setState({ currentIndex: 0, showBack: false });
  };

  getFilteredCards = () => {
    const deck = this.getCurrentDeck();
    return this.state.studyOnlyUnlearned
      ? deck.filter((c) => !c.learned)
      : deck;
  };

  render() {
    const {
      frontText,
      backText,
      currentIndex,
      showBack,
      studyOnlyUnlearned,
      currentDeckName,
      decks,
      newDeckName,
    } = this.state;
    const filteredCards = this.getFilteredCards();
    const currentCard = filteredCards[currentIndex];

    return (
      <div
        style={{
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Flashcards Manager</h1>
        <section
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ddd",
          }}
        >
          <h3>Колоды</h3>
          <select
            value={currentDeckName}
            onChange={(e) =>
              this.setState({
                currentDeckName: e.target.value,
                currentIndex: 0,
              })
            }
          >
            {Object.keys(decks).length === 0 && <option>Default</option>}
            {Object.keys(decks).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            placeholder="Новая колода"
            value={newDeckName}
            onChange={(e) => this.setState({ newDeckName: e.target.value })}
            style={{ marginLeft: "10px" }}
          />
          <button onClick={this.addNewDeck}>Создать колоду</button>
        </section>

        <form onSubmit={this.addCard} style={{ marginBottom: "30px" }}>
          <input
            placeholder="Лицевая сторона"
            value={frontText}
            onChange={(e) => this.setState({ frontText: e.target.value })}
          />
          <input
            placeholder="Оборотная сторона"
            value={backText}
            onChange={(e) => this.setState({ backText: e.target.value })}
          />
          <button type="submit">Добавить карточку</button>
        </form>

        <hr />

        <section
          style={{
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Изучение</h2>
          <div>
            <label>
              <input
                type="checkbox"
                checked={studyOnlyUnlearned}
                onChange={(e) =>
                  this.setState({
                    studyOnlyUnlearned: e.target.checked,
                    currentIndex: 0,
                  })
                }
              />{" "}
              Только невыученные
            </label>
            <button onClick={this.shuffleDeck} style={{ marginLeft: "10px" }}>
              Перемешать
            </button>
          </div>

          {filteredCards.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              <div
                onClick={() => this.setState({ showBack: !showBack })}
                style={{
                  height: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #333",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  marginBottom: "10px",
                  backgroundColor: "#fff",
                }}
              >
                {showBack ? currentCard.back : currentCard.front}
              </div>
              <p>
                Карточка {currentIndex + 1} из {filteredCards.length}
              </p>
              <button
                disabled={currentIndex === 0}
                onClick={() =>
                  this.setState({
                    currentIndex: currentIndex - 1,
                    showBack: false,
                  })
                }
              >
                {" "}
                Назад{" "}
              </button>
              <button
                disabled={currentIndex === filteredCards.length - 1}
                onClick={() =>
                  this.setState({
                    currentIndex: currentIndex + 1,
                    showBack: false,
                  })
                }
                style={{ marginLeft: "10px" }}
              >
                {" "}
                Вперед{" "}
              </button>
            </div>
          ) : (
            <p>Колода пуста или все карточки выучены!</p>
          )}
        </section>

        <hr />

        <h3>Список всех карточек в "{currentDeckName}"</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th align="left">Лицо</th>
              <th align="left">Оборот</th>
              <th align="left">Статус</th>
              <th align="left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {this.getCurrentDeck().map((card) => (
              <tr key={card.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{card.front}</td>
                <td>{card.back}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={card.learned}
                    onChange={() => this.toggleLearned(card.id)}
                  />{" "}
                  Выучена
                </td>
                <td>
                  <button onClick={() => this.editCard(card)}>Ред.</button>
                  <button onClick={() => this.deleteCard(card.id)}>
                    Удал.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default FlashcardApp;
