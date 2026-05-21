import React, { useState, useEffect, useCallback, useMemo } from "react";
import DeckManager from "./DeckManager";
import CardForm from "./CardForm";
import CardTableRow from "./CardTableRow";
import "./App.css";

function App() {
  const [decks, setDecks] = useState(() => {
    return JSON.parse(localStorage.getItem("flashcards-decks") || "{}");
  });
  const [currentDeckName, setCurrentDeckName] = useState(() => {
    return localStorage.getItem("flashcards-current-deck") || "Default";
  });

  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [newDeckName, setNewDeckName] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyOnlyUnlearned, setStudyOnlyUnlearned] = useState(false);

  useEffect(() => {
    if (
      Object.keys(decks).length === 0 ||
      (decks["Default"] && decks["Default"].length === 0)
    ) {
      console.log("Запрос к OpenTDB для первой загрузки...");
      fetch("https://opentdb.com/api.php?amount=50&type=boolean")
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            const decodeHTML = (html) => {
              const txt = document.createElement("textarea");
              txt.innerHTML = html;
              return txt.value;
            };

            const apiCards = data.results.map((item, index) => ({
              id: Date.now() + index,
              front: decodeHTML(item.question),
              back: decodeHTML(item.correct_answer),
              learned: false,
            }));

            setDecks({ Default: apiCards });
          }
        })
        .catch((err) => console.error("Ошибка загрузки API:", err));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem("flashcards-decks", JSON.stringify(decks));
      localStorage.setItem("flashcards-current-deck", currentDeckName);
      console.log("Прогресс сохранен в LocalStorage (Интервал)");
    }, 5000);

    return () => clearInterval(timer);
  }, [decks, currentDeckName]);

  const currentDeckCards = useMemo(() => {
    return decks[currentDeckName] || [];
  }, [decks, currentDeckName]);

  const filteredCards = useMemo(() => {
    return studyOnlyUnlearned
      ? currentDeckCards.filter((c) => !c.learned)
      : currentDeckCards;
  }, [currentDeckCards, studyOnlyUnlearned]);

  const currentCard = filteredCards[currentIndex];

  const handleSelectDeck = useCallback((e) => {
    setCurrentDeckName(e.target.value);
    setCurrentIndex(0);
    setShowBack(false);
  }, []);

  const handleNewDeckNameChange = useCallback((e) => {
    setNewDeckName(e.target.value);
  }, []);

  const handleAddDeck = useCallback(() => {
    if (newDeckName.trim() && !decks[newDeckName]) {
      setDecks((prev) => ({ ...prev, [newDeckName]: [] }));
      setCurrentDeckName(newDeckName);
      setNewDeckName("");
      setCurrentIndex(0);
    }
  }, [newDeckName, decks]);

  const handleFrontChange = useCallback(
    (e) => setFrontText(e.target.value),
    [],
  );
  const handleBackChange = useCallback((e) => setBackText(e.target.value), []);

  const handleAddCard = useCallback(
    (e) => {
      e.preventDefault();
      if (!frontText.trim() || !backText.trim()) return;

      const newCard = {
        id: Date.now(),
        front: frontText,
        back: backText,
        learned: false,
      };

      setDecks((prev) => ({
        ...prev,
        [currentDeckName]: [...(prev[currentDeckName] || []), newCard],
      }));
      setFrontText("");
      setBackText("");
    },
    [frontText, backText, currentDeckName],
  );

  const handleDeleteCard = useCallback(
    (id) => {
      setDecks((prev) => {
        const updated = prev[currentDeckName].filter((c) => c.id !== id);
        return { ...prev, [currentDeckName]: updated };
      });

      setCurrentIndex((prev) => {
        const nextLength = currentDeckCards.length - 1;
        return prev >= nextLength ? Math.max(0, nextLength - 1) : prev;
      });
    },
    [currentDeckName, currentDeckCards.length],
  );

  const handleEditCard = useCallback(
    (card) => {
      setFrontText(card.front);
      setBackText(card.back);
      handleDeleteCard(card.id);
    },
    [handleDeleteCard],
  );

  const handleToggleLearned = useCallback(
    (id) => {
      setDecks((prev) => ({
        ...prev,
        [currentDeckName]: prev[currentDeckName].map((c) =>
          c.id === id ? { ...c, learned: !c.learned } : c,
        ),
      }));
    },
    [currentDeckName],
  );

  const handleShuffle = useCallback(() => {
    const shuffled = [...currentDeckCards].sort(() => Math.random() - 0.5);
    setDecks((prev) => ({ ...prev, [currentDeckName]: shuffled }));
    setCurrentIndex(0);
    setShowBack(false);
  }, [currentDeckCards, currentDeckName]);

  return (
    <div className="container">
      <h1>Flashcards Manager</h1>

      <DeckManager
        decks={decks}
        currentDeckName={currentDeckName}
        onSelectDeck={handleSelectDeck}
        newDeckName={newDeckName}
        onNewDeckNameChange={handleNewDeckNameChange}
        onAddDeck={handleAddDeck}
      />

      <CardForm
        frontText={frontText}
        backText={backText}
        onFrontChange={handleFrontChange}
        onBackChange={handleBackChange}
        onSubmit={handleAddCard}
      />

      <hr />
      <section className="study-area">
        <h2>Изучение</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={studyOnlyUnlearned}
              onChange={(e) => {
                setStudyOnlyUnlearned(e.target.checked);
                setCurrentIndex(0);
              }}
            />{" "}
            Только невыученные
          </label>
          <button onClick={handleShuffle} style={{ marginLeft: "10px" }}>
            Перемешать
          </button>
        </div>

        {filteredCards.length > 0 ? (
          <div style={{ marginTop: "20px" }}>
            <div
              onClick={() => setShowBack(!showBack)}
              style={{ cursor: "pointer" }}
            >
              {showBack ? currentCard.back : currentCard.front}
            </div>
            <p>
              Карточка {currentIndex + 1} из {filteredCards.length}
            </p>
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => prev - 1);
                setShowBack(false);
              }}
            >
              {" "}
              Назад{" "}
            </button>
            <button
              disabled={currentIndex === filteredCards.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                setShowBack(false);
              }}
              style={{ marginLeft: "10px" }}
            >
              {" "}
              Вперед{" "}
            </button>
          </div>
        ) : (
          <p style={{ marginTop: "20px" }}>
            Колода пуста или все карточки выучены!
          </p>
        )}
      </section>

      <hr />

      <h3>
        Список всех карточек в "{currentDeckName}" ({currentDeckCards.length})
      </h3>
      <table>
        <thead>
          <tr>
            <th>Лицо</th>
            <th>Оборот</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {currentDeckCards.map((card) => (
            <CardTableRow
              key={card.id}
              card={card}
              onToggleLearned={handleToggleLearned}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
