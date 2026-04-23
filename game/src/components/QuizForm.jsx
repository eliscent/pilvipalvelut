import { useState } from "react";

function QuizForm({ onSubmitGuess, correctPrice }) {
  const [guess, setGuess] = useState("");

  if (correctPrice != null) {
    return (
      <div>
        <h3>Tulos</h3>
        <p>Oikea hinta: {correctPrice} €</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitGuess(Number(guess));
      }}
    >
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Arvaa hinta (€)"
        required
      />
      <button>Arvaa</button>
    </form>
  );
}

export default QuizForm;