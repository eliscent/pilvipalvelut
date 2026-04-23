import { useEffect, useState } from "react";

function generateCodename() {
  const adjectives = ["Sneaky", "Crazy", "Silent", "Wild", "Shadow"];
  const animals = ["Panda", "Tiger", "Fox", "Eagle", "Wolf"];

  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNumber = Math.floor(Math.random() * 100);

  return `${randomAdj}${randomAnimal}${randomNumber}`;
}

function App() {
  const [codename, setCodename] = useState("");

  useEffect(() => {
    const cachedName = localStorage.getItem("codename");

    if (cachedName) {
      setCodename(cachedName);
    } else {
      const newName = generateCodename();
      localStorage.setItem("codename", newName);
      setCodename(newName);
    }
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Tervetuloa</h1>
      <p>Sinun koodinimesi on:</p>
      <h2>{codename}</h2>
      <button onClick={() => {
  const newName = generateCodename();
  localStorage.setItem("codename", newName);
  setCodename(newName);
}}>
  Generoi uusi nimi
</button>
    </div>
  );
}

export default App;