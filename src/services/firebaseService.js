import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "../firebase"

/* =======================
   QUESTIONS (ADMIN)
======================= */

// Delete old questions
export async function clearQuestions() {
  const ref = collection(db, "questions")
  const snapshot = await getDocs(ref)

  for (let doc of snapshot.docs) {
    await deleteDoc(doc.ref)
  }
}

// Save parsed questions
export async function saveQuestions(questions) {
  const ref = collection(db, "questions")

  for (let q of questions) {
    await addDoc(ref, q)
  }
}

// Fetch questions (STUDENT)
export async function getQuestions() {
  const ref = collection(db, "questions")
  const snapshot = await getDocs(ref)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/* =======================
   SUBMISSIONS (STUDENT)
======================= */

// ✅ THIS IS WHAT WAS MISSING
// export async function saveSubmission({ testId, responses }) {
//   const ref = collection(db, "submissions")

//   await addDoc(ref, {
//     testId,
//     responses,
//     submittedAt: new Date().toISOString(),
//   })
// }

// Optional: admin view
export async function getSubmissions() {
  const ref = collection(db, "submissions")
  const snapshot = await getDocs(ref)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function saveSubmission({
  testId,
  userId,
  name,
  email,
  responses,
}) {
  const ref = collection(db, "submissions")

  await addDoc(ref, {
    testId,
    userId,
    name,
    email,
    responses,
    submittedAt: new Date().toISOString(),
  })
}