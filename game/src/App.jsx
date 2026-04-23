import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm.jsx";
import RoundResult from "./components/RoundResult";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState("");
  const [players, setPlayers] = useState([]);
  const [correctPrice, setCorrectPrice] = useState(null);
  const [product, setProduct] = useState(null);

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    return (
      animals[Math.floor(Math.random() * animals.length)] +
      Math.floor(Math.random() * 100)
    );
  };

  // DummyJSON fetch
  async function fetchRandomProduct() {
    const res = await fetch("https://dummyjson.com/products");
    const data = await res.json();

    const products = data.products;
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
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

      // 👤 yksi pelaaja
      setPlayers([
        {
          id: firebaseUser.uid,
          codename: name,
          guess: null,
          score: 0,
        },
      ]);

      // hae tuote
      try {
        const p = await fetchRandomProduct();
        setProduct(p);
      } catch (err) {
        console.error("API error:", err);

        // fallback
        setProduct({
          title: "Fallback Product",
          price: 50,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // ARVAUS
function submitGuess(guess) {
  const price = product.price;

  const updatedPlayers = players.map((p) => {
    const diff = Math.abs(guess - price);
    const points = Math.max(0, 100 - diff);

    return {
      ...p,
      guess,
      score: p.score + points,
    };
  });

  setPlayers(updatedPlayers);
  setCorrectPrice(price);
}

  return (
    <div>
      {user ? (
        <>
          <p>👋 Tervetuloa, {codename}</p>
          <button onClick={logout}>Kirjaudu ulos</button>

          {/* TUOTE */}
          {product && (
            <p>
              Arvattava tuote: <strong>{product.title}</strong>
            </p>
          )}

          {!correctPrice ? (
            <QuizForm
              onSubmitGuess={submitGuess}
              players={players}
              currentUserId={codename}
            />
          ) : (
            <RoundResult
              players={players}
              correctPrice={correctPrice}
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