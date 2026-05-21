import React from "react";

const DeckManager = React.memo(
  ({
    decks,
    currentDeckName,
    onSelectDeck,
    newDeckName,
    onNewDeckNameChange,
    onAddDeck,
  }) => {
    console.log("--- Рендер DeckManager ---");
    return (
      <section className="decks-manager">
        <h3>Колоды</h3>
        <select value={currentDeckName} onChange={onSelectDeck}>
          {Object.keys(decks).length === 0 && <option>Default</option>}
          {Object.keys(decks).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Новая колода"
          value={newDeckName}
          onChange={onNewDeckNameChange}
        />
        <button onClick={onAddDeck}>Создать колоду</button>
      </section>
    );
  },
);

export default DeckManager;
