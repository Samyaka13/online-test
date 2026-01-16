// src/utils/generateTestReport.js

export function generateTestReport(testTitle, questions, submissions) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  return submissions.map((sub) => {
    // 1. Calculate/Retrieve Score
    let correctCount = 0;
    let totalScorable = 0;

    if (sub.calculatedScore) {
        correctCount = sub.calculatedScore.correct; // Uses the 5.9
        totalScorable = sub.calculatedScore.total;
    } else {
        // Fallback logic for old tests
        questions.forEach((q, index) => {
            if (q.type === 'mcq' && q.correctAnswer) {
                totalScorable++;
                const val = sub.responses?.[index + 1];
                if (val && val.toLowerCase() === q.correctAnswer.toLowerCase()) correctCount++;
            }
        });
    }

    const percentage = totalScorable > 0 
        ? ((correctCount / totalScorable) * 100).toFixed(2) + "%" 
        : "0%";

    // 2. Build Row
    const row = {
      "Student Name": sub.name || "N/A",
      "Email": sub.email || "N/A",
      "Submitted At": sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A",
      "Total Score": `${correctCount}/${totalScorable}`, // e.g. "5.9/16"
      "Percentage": percentage,
      "Test Title": testTitle
    };

    // 3. Add Question Columns
    questions.forEach((q, index) => {
      const qNum = index + 1;
      const answer = sub.responses ? sub.responses[qNum] : "";
      
      // Optional: Add score feedback to the text cell
      let cellText = answer || "Not Answered";
      if (sub.detailedAnalysis && sub.detailedAnalysis[qNum]) {
         const da = sub.detailedAnalysis[qNum];
         // cellText += `\n[Score: ${da.score} - ${da.feedback}]`; 
         // Uncomment above line if you want scores inside the text CSV too
      }

      row[`Q${qNum}: ${q.questionText}`] = cellText;
    });

    return row;
  });
}