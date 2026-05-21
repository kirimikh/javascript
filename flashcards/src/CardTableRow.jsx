import React from "react";

const CardTableRow = React.memo(
  ({ card, onToggleLearned, onEdit, onDelete }) => {
    console.log(`--- Рендер строки карточки ID: ${card.id} ---`);
    return (
      <tr>
        <td>{card.front}</td>
        <td>{card.back}</td>
        <td>
          <label>
            <input
              type="checkbox"
              checked={card.learned}
              onChange={() => onToggleLearned(card.id)}
            />{" "}
            Выучена
          </label>
        </td>
        <td>
          <button onClick={() => onEdit(card)}>Ред.</button>
          <button
            onClick={() => onDelete(card.id)}
            style={{ marginLeft: "6px" }}
          >
            Удал.
          </button>
        </td>
      </tr>
    );
  },
);

export default CardTableRow;
