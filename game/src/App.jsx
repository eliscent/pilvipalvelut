import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm.jsx";
import { createSession } from "./gameSessionService";
import { resolveRound } from "./gameController";
import RoundResult from "./components/RoundResult";

import {
  updateGame,
  subscribeToGame,
} from "./services/firestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState(null);
  const [session, setSession] = useState(null);

  const GAME_ID = "main-game"; // 🔥 yksi yhteinen peli

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    const random = Math.floor(Math.random() * animals.length);
    const number = Math.floor(Math.random() * 100);
    return animals[random] + number;
  };

  // AUTH + AUTO JOIN GAME
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setCodename(null);
        return;
      }

      (async () => {
        const uid = firebaseUser.uid;

        let name = localStorage.getItem(uid);
        if (!name) {
          name = generateCodename();
          localStorage.setItem(uid, name);
        }

        setUser(firebaseUser);
        setCodename(name);

        const player = {
          id: uid,
          codename: name,
          score: 0,
          guess: null,
        };

        try {
          // haetaan vanha peli tai luodaan uusi
          const newSession = await createSession({
            name: "Main Game",
            creatorName: name,
          });

          const sessionData = {
            ...newSession,
            status: "waiting",
            players: [player],
            product: {
              title: "Test Product",
              price: 100,
            },
          };

          await updateGame(GAME_ID, sessionData);

        } catch (err) {
          console.error("SESSION ERROR:", err);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  // REALTIME KUUNTELU
  useEffect(() => {
    const unsubscribe = subscribeToGame(GAME_ID, (data) => {
      if (!data) return;

      setSession({
        ...data,
        id: GAME_ID,
      });
    });

    return () => unsubscribe();
  }, []);

  // ARVAUS
  async function submitGuess(guess) {
    if (!session) return;

    const updatedPlayers = session.players.map((p) =>
      p.id === user.uid ? { ...p, guess } : p
    );

    const updatedSession = {
      ...session,
      players: updatedPlayers,
      correctPrice: session.product.price,
      status: "finished",
    };

    resolveRound(updatedSession);

    await updateGame(GAME_ID, updatedSession);
  }

  return (
    <div>
      {user ? (
        <>
          <p>👋 Tervetuloa, {codename || "..."}</p>
          <button onClick={logout}>Kirjaudu ulos</button>

          {/* TUOTE */}
          {session?.product && (
            <p>
              Arvattava tuote: <strong>{session.product.title}</strong>
            </p>
          )}

          {/* WAITING */}
          {session?.status === "waiting" && (
            <button
              onClick={async () => {
                await updateGame(GAME_ID, {
                  ...session,
                  status: "playing",
                });
              }}
            >
              Aloita peli
            </button>
          )}

          {/* PLAYING */}
          {session?.status === "playing" && (
            <QuizForm
              onSubmitGuess={(guess) => submitGuess(guess)}
              players={session.players}
              currentUserId={codename}
              correctPrice={session?.correctPrice}
            />
          )}

          {/* FINISHED */}
          {session?.status === "finished" && (
            <RoundResult
              players={session.players}
              correctPrice={session.correctPrice}
            />
          )}
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;