export async function createSession({ name, creatorName }) {
  return {
    id: crypto.randomUUID(),
    sessionName: name,
    players: [],
    currentRound: 1,
    correctPrice: null,
    status: "waiting",
  };
}