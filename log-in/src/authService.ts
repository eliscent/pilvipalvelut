import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from "firebase/auth";

import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";

// 🔥 Alustetaan Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth käyttöön
export const auth = getAuth(app);

/**
 * Kirjautuminen sähköposti + salasana
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const result: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return result.user;
};

/**
 * Käyttäjän rekisteröinti (ei pakollinen tässä tehtävässä)
 */
export const registerWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const result: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return result.user;
};

/**
 * Kirjautuminen ulos
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};