import React, { useState } from "react";
import "./EmojiPickerButton.css";

const EMOJIS_COUNT = 50;
const EMOJIS_COLUMNS = 11;
const ITEM_SIZE = 22;

const EmojiPickerButton = ({ setShowEmojiPicket }) => {
  const [index, setIndex] = useState(0);

  const pickRandomIndex = () => {
    setIndex(Math.floor(Math.random() * EMOJIS_COUNT));
  };

  const x = (index % EMOJIS_COLUMNS) * ITEM_SIZE;
  const y = Math.floor(index / EMOJIS_COLUMNS) * ITEM_SIZE;

  return (
    <button
      onMouseEnter={pickRandomIndex}
      className="emoji-picker-button"
      onClick={setShowEmojiPicket}
    >
      <div
        className="emoji"
        style={{
          backgroundSize: "242px 110px",
          backgroundPosition: `-${x}px -${y}px`,
        }}
      />
    </button>
  );
};

export default EmojiPickerButton;