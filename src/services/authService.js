import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "../firebase"

// Register new user
export async function registerUser(email, password) {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  return result.user
}

// Login existing user
export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )
  return result.user
}
