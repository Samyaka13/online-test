// src/utils/parseCSVQuestions.js

export function parseCSVQuestions(rows) {
  return rows.map((row, index) => {
    // 1. Extract basic fields
    const type = row.type?.trim().toLowerCase()
    const question = row.question?.trim()
    const answer = row.answer?.trim() // Capture the answer

    // 2. Basic Validation
    if (!type || !question) {
      throw new Error(`Invalid row at line ${index + 2}: Missing type or question`)
    }

    // 3. Collect Options
    const options = [
      row.option_a,
      row.option_b,
      row.option_c,
      row.option_d,
      row.option_e,
      row.option_f,
    ]
      .map(opt => opt?.trim())
      .filter(Boolean)

    // 4. Handle MCQ Type
    if (type === "mcq") {
      if (options.length < 2) {
        throw new Error(
          `MCQ must have at least 2 options at line ${index + 2}`
        )
      }

      // Check if answer is provided for MCQs
      if (!answer) {
        throw new Error(`MCQ at line ${index + 2} is missing the 'answer' field`)
      }

      // Optional: strict check to ensure the answer matches one of the options exactly
      // if (!options.includes(answer)) {
      //   throw new Error(`Answer at line ${index + 2} does not match any provided options`)
      // }

      return {
        type: "mcq",
        questionText: question,
        options,
        correctAnswer: answer, // Storing the correct answer
      }
    }

    // 5. Handle Long Answer Type
    if (type === "long") {
      return {
        type: "long",
        questionText: question,
        options: [],
        correctAnswer: answer || "", // Long answers might not have a strict key, but we save it if present
      }
    }

    throw new Error(`Unknown question type '${type}' at line ${index + 2}`)
  })
}