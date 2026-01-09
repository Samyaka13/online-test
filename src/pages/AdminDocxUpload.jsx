import { useState } from "react"
import mammoth from "mammoth"
import { parseQuestions } from "../utils/parseQuestions"
import {
  clearQuestions,
  saveQuestions,
} from "../services/firebaseService"

export default function AdminDocxUpload() {
  const [status, setStatus] = useState("")
  const [preview, setPreview] = useState([])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.endsWith(".docx")) {
      setStatus("❌ Please upload a DOCX file")
      return
    }

    try {
      setStatus("⏳ Extracting and parsing DOCX...")

      // 1️⃣ Read DOCX
      const arrayBuffer = await file.arrayBuffer()

      // 2️⃣ Extract raw text
      const result = await mammoth.extractRawText({ arrayBuffer })

      // 3️⃣ Parse questions (MCQ + Long)
      const parsedQuestions = parseQuestions(result.value)

      if (parsedQuestions.length === 0) {
        setStatus("❌ No questions detected in document")
        return
      }

      // 4️⃣ Clear old questions
      await clearQuestions()

      // 5️⃣ Save new questions
      await saveQuestions(parsedQuestions)

      // 6️⃣ Optional preview (admin confidence)
      setPreview(parsedQuestions.slice(0, 3))

      setStatus(
        `✅ ${parsedQuestions.length} questions uploaded. Test is now live.`
      )
    } catch (err) {
      console.error(err)
      setStatus("❌ Failed to upload questions")
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow w-[700px]">
      <h1 className="text-xl font-bold mb-4">
        Admin – Upload Test Questions (DOCX)
      </h1>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {status && (
        <p className="mb-4 text-sm">
          {status}
        </p>
      )}

      {/* Small preview so admin knows parsing worked */}
      {preview.length > 0 && (
        <>
          <h2 className="font-semibold mb-2">
            Preview (first 3 questions)
          </h2>
          <pre className="text-xs bg-gray-100 p-3 max-h-[250px] overflow-auto">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </>
      )}
    </div>
  )
}
