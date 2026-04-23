import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

import QuizForm from "./components/QuizForm";
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

        setSession(newSession);

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
      session.correctPrice = product.price;
      resolveRound(session, guess);
      setSession({ ...session });
    }
  }

  return (
    <div>
      {user ? (
        <>
          <p>👋 Tervetuloa, {codename || "..."}</p>
          <button onClick={logout}>Kirjaudu ulos</button>

          {product && (
            <p>Arvattava tuote: {product.title}</p>
          )}

          <QuizForm
            onSubmitGuess={(guess) => submitGuess(guess)}
            players={[]}
            currentUserId={codename}
            correctPrice={session?.correctPrice}
          />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;