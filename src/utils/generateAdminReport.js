export function generateAdminReport(submissions) {
  // 1️⃣ Find maximum question number across ALL submissions
  let maxQ = 0

  submissions.forEach((sub) => {
    if (!sub.responses) return
    Object.keys(sub.responses).forEach((q) => {
      const qNum = Number(q)
      if (!isNaN(qNum)) {
        maxQ = Math.max(maxQ, qNum)
      }
    })
  })

  console.log("Max Question Count:", maxQ)

  // 2️⃣ Build rows
  const rows = submissions.map((sub) => {
    const row = {
      name: sub.name || "",
      email: sub.email || "",
    }

    // Initialize all Q columns
    for (let i = 1; i <= maxQ; i++) {
      row[`Q${i}`] = ""
    }

    // Fill answers
    if (sub.responses) {
      Object.entries(sub.responses).forEach(([q, answer]) => {
        row[`Q${q}`] = answer
      })
    }

    return row
  })

  console.log("Generated Report Rows:", rows)

  return rows
}
