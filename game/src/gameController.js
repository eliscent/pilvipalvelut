export function resolveRound(session) {
  const correctPrice = session.correctPrice;

  session.players = session.players.map(p => {
    const diff = Math.abs(p.guess - correctPrice);

    const score = Math.max(0, 100 - diff);

    return {
      ...p,
      score: p.score + score,
    };
  });
}