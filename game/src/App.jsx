import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm.jsx";
import { createSession } from "./gameSessionService";
import { resolveRound } from "./gameController";
import { fetchRandomProduct } from "./services/productService";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState(null);
  const [session, setSession] = useState(null);
  const [product, setProduct] = useState(null);

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    const random = Math.floor(Math.random() * animals.length);
    const number = Math.floor(Math.random() * 100);
    return animals[random] + number;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        let name = localStorage.getItem(uid);

        if (!name) {
          name = generateCodename();
          localStorage.setItem(uid, name);
        }

        setCodename(name);

        const newSession = await createSession({
          name: name + "-session",
          creatorName: name,
        });

        const player = {
        id: firebaseUser.uid,
        codename: name,
        score: 0,
        guess: null,
        };

        setSession({
        ...newSession,
        status: "waiting",
        players: [player],
        });

        const randomProduct = await fetchRandomProduct();
        setProduct(randomProduct);
      } else {
        setCodename(null);
      }
    });

    return () => unsubscribe();
  }, []);

function submitGuess(guess) {
  if (session && product) {
    const updatedPlayers = session.players.map(p =>
      p.id === user.uid ? { ...p, guess } : p
    );

    setSession({
      ...session,
      players: updatedPlayers,
      correctPrice: product.price,
      status: "finished",
    });

    resolveRound(session, guess);
  }
}

  return (
    <div>
{user ? (
  <>
    <p>👋 Tervetuloa, {codename || "..."}</p>
    <button onClick={logout}>Kirjaudu ulos</button>

    {/* TUOTE */}
    {product && (
      <p>Arvattava tuote: {product.title}</p>
    )}

    {/* KOHTA 4 */}
    {session?.status === "waiting" && (
      <button
        onClick={() => {
          setSession({ ...session, status: "playing" });
        }}
      >
        Aloita peli
      </button>
    )}

    {/* KOHTA 3 */}
    {session?.status === "playing" && (
      <QuizForm
        onSubmitGuess={(guess) => submitGuess(guess)}
        players={[]}
        currentUserId={codename}
        correctPrice={session?.correctPrice}
      />
    )}

    {session?.status === "finished" && (
<div>
  <h3>Kierroksen tulos</h3>
  <p>Oikea hinta: {session.correctPrice} €</p>

  <ul>
    {session.players.map(p => (
      <li key={p.id}>
        {p.codename}: {p.guess} €
        (pisteet: {p.score})
      </li>
    ))}
  </ul>
</div>
    )}
  </>
) : (
  <LoginForm />
)}
    </div>
  );
}

export default App;