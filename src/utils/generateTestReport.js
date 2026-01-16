// src/utils/generateTestReport.js

export function generateTestReport(testTitle, questions, submissions) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  return submissions.map((sub) => {
    let correctCount = 0;
    let totalScorable = 0;

    // 1. Calculate Score for this submission
    questions.forEach((q, index) => {
      // Only grade MCQs that have a parsed correct answer
      if (q.type === 'mcq' && q.correctAnswer) {
        totalScorable++;
        const questionNumber = index + 1;
        const userAnswer = sub.responses ? sub.responses[questionNumber] : "";
        
        // Case-insensitive comparison
        if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          correctCount++;
        }
      }
    });

    // Format Score Strings
    const scoreStr = `${correctCount}/${totalScorable}`;
    const percentageStr = totalScorable > 0 
      ? `${((correctCount / totalScorable) * 100).toFixed(2)}%` 
      : "N/A";

    // 2. Build the Row Object
    // The keys here become the CSV Headers
    const row = {
      "Student Name": sub.name || "N/A",
      "Email": sub.email || "N/A",
      "Submitted At": sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A",
      "Total Score": scoreStr,       // <--- NEW COLUMN
      "Percentage": percentageStr,   // <--- NEW COLUMN
      "Test Title": testTitle
    };

    // 3. Add Individual Answers
    questions.forEach((q, index) => {
      const questionNumber = index + 1;
      const answer = sub.responses ? sub.responses[questionNumber] : "";
      
      // We label the column with "Q1: [Question Text]"
      row[`Q${index + 1}: ${q.questionText}`] = answer || "Not Answered";
    });

    return row;
  });
}