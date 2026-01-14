export function generateTestReport(testTitle, questions, submissions) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  // 1. Create Headers (Static Fields + Question Text)
  // We use Question Text as the header for clarity
  const headers = [
    "Student Name",
    "Email",
    "Submitted At",
    "Test Title",
    ...questions.map((q, index) => `Q${index + 1}: ${q.questionText}`)
  ];

  // 2. Map Submissions to Rows
  const rows = submissions.map((sub) => {
    // Basic Info
    const row = {
      "Student Name": sub.name || "N/A",
      "Email": sub.email || "N/A",
      "Submitted At": sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A",
      "Test Title": testTitle
    };

    // Map Answers to Questions
    questions.forEach((q, index) => {
      // Answers are stored by Question Number (1, 2, 3...)
      const questionNumber = index + 1;
      const answer = sub.responses ? sub.responses[questionNumber] : "";
      
      // Add to row with the specific Header Key
      row[`Q${index + 1}: ${q.questionText}`] = answer || "Not Answered";
    });

    return row;
  });

  return rows;
}