import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState(null);

  const generateCodename = () => {
    const animals = ["Fox", "Wolf", "Tiger", "Eagle", "Shadow", "Raven"];
    const random = Math.floor(Math.random() * animals.length);
    const number = Math.floor(Math.random() * 100);
    return animals[random] + number;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        let savedCodename = localStorage.getItem(uid);

        if (!savedCodename) {
          savedCodename = generateCodename();
          localStorage.setItem(uid, savedCodename);
        }

        setCodename(savedCodename);
      } else {
        setCodename(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <>
        <p>👋 Tervetuloa, {codename || "..."}</p>
        <button onClick={logout}>Kirjaudu ulos</button>
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;