function RoundResult({ players, correctPrice }) {
  return (
    <div>
      <h3>Kierroksen tulos</h3>

      <p>Oikea hinta: {correctPrice} €</p>

      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.codename}: {p.guess} €
            (ero {Math.abs(p.guess - correctPrice)} €)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoundResult;