export function parseCSVQuestions(rows) {
  return rows.map((row, index) => {
    // 1. Extract basic fields
    const type = row.type?.trim().toLowerCase()
    const question = row.question?.trim()
    const answer = row.answer?.trim()

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

      if (!answer) {
        throw new Error(`MCQ at line ${index + 2} is missing the 'answer' field`)
      }

      return {
        type: "mcq",
        questionText: question,
        options,
        correctAnswer: answer,
      }
    }

    // 5. Handle Long Answer Type (UPDATED)
    if (type === "long") {
      // For AI grading, the 'answer' column serves as the Reference Answer
      if (!answer) {
         throw new Error(`Long Answer at line ${index + 2} is missing the 'answer' (reference) field`)
      }

      return {
        type: "long",
        questionText: question,
        options: [],
        referenceAnswer: answer, // <--- Key change: Save as referenceAnswer
      }
    }

    throw new Error(`Unknown question type '${type}' at line ${index + 2}`)
  })
}