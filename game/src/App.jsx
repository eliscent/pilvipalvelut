import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm.jsx";
import RoundResult from "./components/RoundResult";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState("");
  const [player, setPlayer] = useState(null);
  const [correctPrice, setCorrectPrice] = useState(null);
  const [product, setProduct] = useState(null);

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    return animals[Math.floor(Math.random() * animals.length)] +
           Math.floor(Math.random() * 100);
  };

  // DummyJSON
  async function fetchRandomProduct() {
    const res = await fetch("https://dummyjson.com/products");
    const data = await res.json();
    return data.products[Math.floor(Math.random() * data.products.length)];
  }

  // UUSI KIERROS
  async function newRound() {
    const p = await fetchRandomProduct();

    setProduct(p);
    setCorrectPrice(null);

    setPlayer({
      ...player,
      guess: null,
      // score jätetään → pisteet kertyy
    });
  }

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) return;

      let name = localStorage.getItem(firebaseUser.uid);
      if (!name) {
        name = generateCodename();
        localStorage.setItem(firebaseUser.uid, name);
      }

      setCodename(name);

      setPlayer({
        id: firebaseUser.uid,
        codename: name,
        guess: null,
        score: 0,
      });

      const p = await fetchRandomProduct();
      setProduct(p);
    });

    return () => unsubscribe();
  }, []);

  // ARVAUS
  function submitGuess(guess) {
    const price = product.price;

    const diff = Math.abs(guess - price);
    const points = Math.max(0, 100 - diff);

    setPlayer({
      ...player,
      guess,
      score: player.score + points,
    });

    setCorrectPrice(price);
  }

  return (
    <div>
      {user ? (
        <>
          <p>👋 Tervetuloa, {codename}</p>
          <button onClick={logout}>Kirjaudu ulos</button>

          {product && (
            <p>
              Arvattava tuote: <strong>{product.title}</strong>
            </p>
          )}

          {!correctPrice ? (
            <QuizForm
              onSubmitGuess={submitGuess}
              players={player ? [player] : []}
              currentUserId={codename}
            />
          ) : (
            <>
              <RoundResult
                players={[player]}
                correctPrice={correctPrice}
              />

              <button onClick={newRound}>
                🔄 Uusi kierros
              </button>
            </>
          )}
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;