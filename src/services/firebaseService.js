import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

/* =======================
   TEST MANAGEMENT (ADMIN)
======================= */

// Create a new unique test with a specific ID
export async function createTest(testId, title, questions) {
  const testRef = doc(db, "tests", testId);
  
  // 1. Check if ID already exists to prevent overwriting
  const testSnap = await getDoc(testRef);
  if (testSnap.exists()) {
    throw new Error(`Test ID "${testId}" already exists. Please choose a unique ID.`);
  }

  // 2. Save Test Data
  await setDoc(testRef, {
    title,
    questions, // Storing questions array directly in the document
    createdAt: new Date().toISOString(),
    status: "active", // status can be: 'active' or 'closed'
    createdBy: "admin"
  });
}

// Get list of all uploaded tests for the Dashboard
export async function getAllTests() {
  const snapshot = await getDocs(collection(db, "tests"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    questionCount: doc.data().questions?.length || 0
  }));
}

// (Optional) Delete a test if needed
export async function deleteTest(testId) {
  await deleteDoc(doc(db, "tests", testId));
}

// Toggle test status (active/closed)
export async function toggleTestStatus(testId, newStatus) {
  await setDoc(doc(db, "tests", testId), { status: newStatus }, { merge: true });
}

/* =======================
   TEST TAKING (STUDENT)
======================= */

// Verify if a test exists and is active
// This replaces the old 'getQuestions' and 'getTestStatus'
export async function getTestMetadata(testId) {
  const docRef = doc(db, "tests", testId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error("Invalid Test ID. Exam not found.");
  }

  const data = snap.data();

  if (data.status === "closed") {
    throw new Error("This test has been closed by the admin.");
  }

  // Return full test data including questions
  return { 
    id: snap.id, 
    ...data 
  };
}

// Check if student already attempted THIS specific test
export async function hasUserAlreadyAttempted(email, testId) {
  const q = query(
    collection(db, "submissions"),
    where("email", "==", email),
    where("testId", "==", testId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Submit response
export async function saveSubmission({
  testId,
  userId,
  name,
  email,
  responses,
  calculatedScore,   
  detailedAnalysis
}) {
  const ref = collection(db, "submissions");

  await addDoc(ref, {
    testId,
    userId,
    name,
    email,
    responses,
    calculatedScore: calculatedScore || null,   
    detailedAnalysis: detailedAnalysis || null,
    submittedAt: new Date().toISOString(),
  });
}

/* =======================
   REPORTING (ADMIN)
======================= */

// Get all submissions (can be filtered by testId in the UI)
export async function getAllSubmissions() {
  const snapshot = await getDocs(collection(db, "submissions"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get submissions for a specific test
export async function getSubmissionsByTest(testId) {
  const q = query(
    collection(db, "submissions"),
    where("testId", "==", testId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}