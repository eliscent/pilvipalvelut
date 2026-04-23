import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm.jsx";
import { createSession } from "./gameSessionService";
import { resolveRound } from "./gameController";
import { fetchRandomProduct } from "./services/productService";
import RoundResult from "./components/RoundResult";

import {
  createGame,
  updateGame,
  subscribeToGame,
  joinGame,
} from "./services/firestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState(null);
  const [session, setSession] = useState(null);
  const [gameIdInput, setGameIdInput] = useState("");

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    const random = Math.floor(Math.random() * animals.length);
    const number = Math.floor(Math.random() * 100);
    return animals[random] + number;
  };

  // AUTH + SESSION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setCodename(null);
        return;
      }

      const uid = firebaseUser.uid;

      let name = localStorage.getItem(uid);
      if (!name) {
        name = generateCodename();
        localStorage.setItem(uid, name);
      }

      setCodename(name);

      try {
        const newSession = await createSession({
          name: name + "-session",
          creatorName: name,
        });

        const player = {
          id: uid,
          codename: name,
          score: 0,
          guess: null,
        };

        // FETCH
        let randomProduct;
        try {
          randomProduct = await fetchRandomProduct();
          console.log("PRODUCT:", randomProduct);
        } catch (err) {
          console.error("PRODUCT ERROR:", err);

          // fallback ettei peli hajoa
          randomProduct = {
            title: "Fallback Product",
            price: 50,
          };
        }

        const sessionWithPlayer = {
          ...newSession,
          status: "waiting",
          players: [player],
          product: {
            title: randomProduct.title,
            price: randomProduct.price,
          },
        };

        const gameId = await createGame(sessionWithPlayer);

        setSession({
          ...sessionWithPlayer,
          id: gameId,
        });

      } catch (error) {
        console.error("SESSION ERROR:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // REALTIME
  useEffect(() => {
    if (!session?.id) return;

    const gameId = session.id;

    const unsubscribe = subscribeToGame(gameId, (data) => {
      setSession({
        ...data,
        id: gameId,
      });
    });

    return () => unsubscribe();
  }, [session?.id]);

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

    await updateGame(session.id, updatedSession);
  }

  return (
    <div>
      {user ? (
        <>
          <p>👋 Tervetuloa, {codename || "..."}</p>
          <button onClick={logout}>Kirjaudu ulos</button>

          {/* GAME ID */}
          {session?.id && (
            <p>
              Game ID: <strong>{session.id}</strong>
            </p>
          )}

          {/* LIITY */}
          <div>
            <input
              placeholder="Syötä pelin ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
            />

            <button
              onClick={async () => {
                if (!gameIdInput) return;

                const player = {
                  id: user.uid,
                  codename: codename,
                  score: 0,
                  guess: null,
                };

                await joinGame(gameIdInput, player);

                setSession({
                  ...session,
                  id: gameIdInput,
                });
              }}
            >
              Liity peliin
            </button>
          </div>

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
                await updateGame(session.id, {
                  ...session,
                  status: "playing",
                  lastActivity: Date.now(),
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