// export function parseQuestions(rawText) {
//   const lines = rawText
//     .replace(/\r/g, "")
//     .split("\n")
//     .map(l => l.trim())
//     .filter(Boolean)

//   const questionsMap = new Map()
//   let currentQuestionId = null

//   /* =========================
//      PHASE 1: REGISTER QUESTIONS
//   ========================== */

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i]

//     // Detect question header
//     if (/^Question\s+\d+$/i.test(line)) {
//       const id = Number(line.match(/\d+/)[0])

//       if (!questionsMap.has(id)) {
//         questionsMap.set(id, {
//           id,
//           type: "unknown",
//           questionText: "",
//           options: [],
//         })
//       }

//       // Look ahead for type
//       const nextLine = lines[i + 1] || ""
//       if (/multiple choice/i.test(nextLine)) {
//         questionsMap.get(id).type = "mcq"
//       }
//       if (/long form/i.test(nextLine)) {
//         questionsMap.get(id).type = "long"
//       }

//       currentQuestionId = id
//     }
//   }

//   /* =========================
//      PHASE 2: ATTACH CONTENT
//   ========================== */

//   currentQuestionId = null

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i]

//     // Reset when new question header appears
//     if (/^Question\s+\d+$/i.test(line)) {
//       currentQuestionId = Number(line.match(/\d+/)[0])
//       continue
//     }

//     if (!currentQuestionId) continue

//     const q = questionsMap.get(currentQuestionId)
//     if (!q) continue

//     // Skip metadata
//     if (
//       /^multiple choice$/i.test(line) ||
//       /^long form$/i.test(line) ||
//       /^situational judgment$/i.test(line)
//     ) {
//       continue
//     }

//     // MCQ Options
//     if (/^[A-E]\.\s+/.test(line)) {
//       q.options.push(line)
//       continue
//     }

//     // Ignore stray numeric junk
//     if (/^\d+$/.test(line)) continue

//     // Append question text (limit runaway growth)
//     if (q.questionText.length < 2000) {
//       q.questionText += line + " "
//     }
//   }

//   /* =========================
//      FINAL CLEANUP
//   ========================== */

//   return Array.from(questionsMap.values())
//     .map(q => ({
//       id: q.id,
//       type: q.type === "unknown"
//         ? q.options.length > 0 ? "mcq" : "long"
//         : q.type,
//       questionText: q.questionText.trim(),
//       options: q.options,
//     }))
//     .filter(q => q.questionText.length > 20)
// }


export function parseQuestions(rawText) {
  // 1. Clean the text and split into lines
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);

  const questions = [];
  let currentQuestion = null;

  // Regex to catch "Question 1", "Question1", "Question 1 of 75"
  // Note: \s* allows for zero spaces (handling "Question11")
  const questionStartRegex = /^Question\s*\d+/i;
  
  // Regex to catch options like "A. ", "A) ", "(A) "
  const optionStartRegex = /^([A-Ea-e])[\.\)]\s+(.*)/;

  lines.forEach((line) => {
    // CASE 1: New Question Start Detected
    if (questionStartRegex.test(line)) {
      // If we were building a question, save it before starting a new one
      if (currentQuestion) {
        finalizeQuestion(currentQuestion);
        questions.push(currentQuestion);
      }

      // Extract ID (e.g., from "Question 11")
      const numMatch = line.match(/\d+/);
      const id = numMatch ? parseInt(numMatch[0], 10) : questions.length + 1;

      // Initialize new question object
      currentQuestion = {
        id: id,
        questionText: "",
        options: [],
        _state: "READING_TEXT" // Internal state to track what we are reading
      };
      return; // Skip the "Question X" line itself
    }

    // If we haven't found the first "Question X" yet, ignore the line (or handle as preamble)
    if (!currentQuestion) return;

    // CASE 2: Option Detected (e.g., "A. Some option text")
    const optionMatch = line.match(optionStartRegex);
    if (optionMatch) {
      currentQuestion._state = "READING_OPTION";
      currentQuestion.options.push(line); // Add the full option line
      return;
    }

    // CASE 3: Content Handling based on State
    if (currentQuestion._state === "READING_OPTION") {
      // We are currently inside the options list.
      // If this line is NOT a new option (checked above), it must be a continuation 
      // of the previous option (multi-line option).
      const lastOptionIndex = currentQuestion.options.length - 1;
      if (lastOptionIndex >= 0) {
        currentQuestion.options[lastOptionIndex] += " " + line;
      }
    } else {
      // We are still reading the Question Text (before any options appeared)
      // Skip "Multiple Choice" or "Situation" labels if they exist
      if (/multiple choice|long form|situational/i.test(line)) return;
      
      currentQuestion.questionText += (currentQuestion.questionText ? "\n" : "") + line;
    }
  });

  // Push the very last question after the loop finishes
  if (currentQuestion) {
    finalizeQuestion(currentQuestion);
    questions.push(currentQuestion);
  }

  return questions;
}

// Helper to clean up the object before returning
function finalizeQuestion(q) {
  q.questionText = q.questionText.trim();
  // Determine type based on whether options exist
  q.type = q.options.length > 0 ? "mcq" : "long";
  // Remove the internal state helper
  delete q._state;
}