import { useState } from "react"
import { clearQuestions, saveQuestions } from "../services/firebaseService"

export default function AdminQuestionForm() {
  const [type, setType] = useState("mcq")
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Question is required")
      return
    }

    if (type === "mcq" && options.some(o => !o.trim())) {
      alert("All 4 options are required")
      return
    }

    const q = {
      id: Date.now(),
      type,
      questionText: question,
      options: type === "mcq" ? options : [],
    }

    // 🔥 This REPLACES paper if admin wants manual paper
    await clearQuestions()
    await saveQuestions([q])

    alert("Question paper replaced with manual question")
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="font-bold mb-2">Add Question Manually</h2>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full mb-2"
      >
        <option value="mcq">MCQ</option>
        <option value="long">Long Answer</option>
      </select>

      <textarea
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      {type === "mcq" &&
        options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const copy = [...options]
              copy[i] = e.target.value
              setOptions(copy)
            }}
            className="border p-2 w-full mb-1"
          />
        ))}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Question
      </button>
    </div>
  )
}
