import React from "react";

const CardForm = React.memo(
  ({ frontText, backText, onFrontChange, onBackChange, onSubmit }) => {
    console.log("--- Рендер CardForm ---");
    return (
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Лицевая сторона"
          value={frontText}
          onChange={onFrontChange}
        />
        <input
          type="text"
          placeholder="Оборотная сторона"
          value={backText}
          onChange={onBackChange}
        />
        <button type="submit">Добавить карточку</button>
      </form>
    );
  },
);

export default CardForm;
