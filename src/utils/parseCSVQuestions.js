export function parseCSVQuestions(rows) {
  return rows.map((row, index) => {
    const type = row.type?.trim().toLowerCase()
    const question = row.question?.trim()

    if (!type || !question) {
      throw new Error(`Invalid row at line ${index + 2}`)
    }

    // Collect all possible options dynamically
    const options = [
      row.option_a,
      row.option_b,
      row.option_c,
      row.option_d,
      row.option_e,
      row.option_f,
    ]
      .map(opt => opt?.trim())
      .filter(Boolean) // removes undefined / empty

    if (type === "mcq") {
      if (options.length < 2) {
        throw new Error(
          `MCQ must have at least 2 options at line ${index + 2}`
        )
      }

      return {
        type: "mcq",
        questionText: question,
        options,
      }
    }

    if (type === "long") {
      return {
        type: "long",
        questionText: question,
        options: [], // ALWAYS empty
      }
    }

    throw new Error(`Unknown question type at line ${index + 2}`)
  })
}
