import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

// create
export async function createGame(session) {
  const ref = await addDoc(collection(db, "games"), session);
  return ref.id;
}

// refresh
export async function updateGame(id, data) {
  const ref = doc(db, "games", id);
  await setDoc(ref, data);
}

// callback
export function subscribeToGame(id, callback) {
  const ref = doc(db, "games", id);
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
}

// join
import { arrayUnion } from "firebase/firestore";

export async function joinGame(gameId, player) {
  const ref = doc(db, "games", gameId);

  await setDoc(
    ref,
    {
      players: arrayUnion(player),
    },
    { merge: true }
  );
}