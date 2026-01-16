// src/utils/generateMarksReport.js

export function generateMarksReport(testTitle, questions, submissions) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  return submissions.map((sub) => {
    // 1. Get Totals from the Saved Submission (Priority)
    // This ensures we get the "5.9" seen in the UI, not a recalculation.
    let totalMarks = 0;
    let maxMarks = 0;

    if (sub.calculatedScore) {
        totalMarks = sub.calculatedScore.correct;
        maxMarks = sub.calculatedScore.total;
    } else {
        // Fallback for old data
        totalMarks = 0; // Default
    }

    // 2. Build Basic Row
    const row = {
      "Student Name": sub.name || "N/A",
      "Email": sub.email || "N/A",
      "Total Marks": totalMarks, // Should now show 5.9
      "Max Marks": maxMarks,
    };

    // 3. Add Columns for Each Question (Q1, Q2, Q3...)
    questions.forEach((q, index) => {
      const qNum = index + 1;
      const qKey = `Q${qNum}`; 
      
      let marksAwarded = 0;

      // CHECK 1: Use Detailed Analysis (AI Scores)
      if (sub.detailedAnalysis && sub.detailedAnalysis[qNum]) {
          marksAwarded = sub.detailedAnalysis[qNum].score;
      } 
      // CHECK 2: Fallback for Legacy MCQs (Exact Match)
      else if (q.type === 'mcq' && q.correctAnswer) {
          const userAns = sub.responses?.[qNum];
          if (userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
              marksAwarded = 1;
          }
      }

      row[qKey] = marksAwarded;
    });

    return row;
  });
}