import { useState } from "react"
import { createTest } from "../services/firebaseService"

export default function AdminQuestionForm({ onSuccess }) {
  // New State for Test Metadata
  const [testTitle, setTestTitle] = useState("")
  const [testId, setTestId] = useState("")

  // Existing State
  const [type, setType] = useState("mcq")
  const [questionText, setQuestionText] = useState("")
  
  // MCQ State
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null)
  
  // NEW: Long Answer State
  const [referenceAnswer, setReferenceAnswer] = useState("")

  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)

  /* =========================
     Add Question Locally
  ========================== */
  const handleAddQuestion = () => {
    // 1. Basic Validation
    if (!questionText.trim()) {
      alert("Question is required")
      return
    }

    // 2. MCQ Validation
    if (type === "mcq") {
        if (options.some(o => !o.trim())) {
            alert("All 4 options are required")
            return
        }
        if (correctOptionIndex === null) {
            alert("Please select the correct answer option")
            return
        }
    }

    // 3. Long Answer Validation (NEW)
    if (type === "long") {
        if (!referenceAnswer.trim()) {
            alert("Please provide a Reference Answer for AI grading.")
            return
        }
    }

    // 4. Create Object
    const newQuestion = {
      id: Date.now(),
      type,
      questionText,
      options: type === "mcq" ? options : [],
      correctAnswer: type === "mcq" ? options[correctOptionIndex] : null,
      referenceAnswer: type === "long" ? referenceAnswer : null, // Save reference
    }

    setQuestions(prev => [...prev, newQuestion])

    // 5. Reset Form
    setQuestionText("")
    setOptions(["", "", "", ""])
    setCorrectOptionIndex(null)
    setReferenceAnswer("") // Reset reference
    setType("mcq")
  }

  /* =========================
     Remove Question
  ========================== */
  const handleRemoveQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  /* =========================
     Publish Question Paper
  ========================== */
  const handlePublish = async () => {
    if (!testTitle.trim() || !testId.trim()) {
      alert("Please provide a Test Title and a Unique Test ID.")
      return
    }

    if (questions.length === 0) {
      alert("Add at least one question before publishing")
      return
    }

    try {
      setSaving(true)
      await createTest(testId, testTitle, questions)
      alert("Test published successfully!")
      
      setQuestions([])
      setTestTitle("")
      setTestId("")
      if (onSuccess) onSuccess()

    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Test Metadata Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Test Title <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. ReactJS Final Assessment"
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Unique Test ID <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                placeholder="e.g. react-final-2024"
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
            />
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Form Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Add Questions</h2>
          <p className="text-sm text-gray-600">Build your question paper one by one</p>
        </div>
      </div>

      {/* Question Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="mcq">Multiple Choice Question (MCQ)</option>
            <option value="long">Long Answer Question</option>
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          placeholder="Enter your question here..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          rows={3}
        />
      </div>

      {/* MCQ Options */}
      {type === "mcq" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Answer Options</span>
            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Select the radio button for the correct answer</span>
          </label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className={`relative flex items-center gap-3 p-1 rounded-lg border-2 transition-all ${
                  correctOptionIndex === i ? 'border-green-500 bg-green-50' : 'border-transparent'
              }`}>
                <input 
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === i}
                    onChange={() => setCorrectOptionIndex(i)}
                    className="w-5 h-5 text-green-600 cursor-pointer focus:ring-green-500 ml-2"
                />
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">{String.fromCharCode(65 + i)}</span>
                    </div>
                    <input
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                        const copy = [...options]
                        copy[i] = e.target.value
                        setOptions(copy)
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 pl-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW: Long Answer Reference Input */}
      {type === "long" && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
           <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              AI Reference Answer
           </label>
           <p className="text-xs text-blue-700 mb-3">
              This answer will be used by the AI model to grade the student's response. Be descriptive and include key points.
           </p>
           <textarea
              placeholder="Enter the ideal answer here. The student's answer will be compared to this for similarity."
              value={referenceAnswer}
              onChange={(e) => setReferenceAnswer(e.target.value)}
              className="w-full border-2 border-blue-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
              rows={5}
           />
        </div>
      )}

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Add Question to List
      </button>

      {/* Preview Added Questions */}
      {questions.length > 0 && (
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">Question Preview</h3>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {questions.length} Questions
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">{q.questionText}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                        q.type === "mcq" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      }`}>
                        {q.type === "mcq" ? "Multiple Choice" : "Long Answer"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>

                {q.type === "mcq" && (
                  <div className="ml-11 mt-1 space-y-1">
                    {q.options.map((o, i) => (
                      <div key={i} className={`flex items-center gap-2 text-sm ${q.correctAnswer === o ? "text-green-700 font-bold" : "text-gray-600"}`}>
                        <span>{q.correctAnswer === o ? "✓" : "•"}</span> {o}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* NEW: Preview Reference Answer */}
                {q.type === "long" && (
                    <div className="ml-11 mt-2 bg-green-50 p-2 rounded border border-green-100">
                        <p className="text-xs font-bold text-green-800 uppercase mb-1">Reference Answer:</p>
                        <p className="text-sm text-green-800 italic line-clamp-2">{q.referenceAnswer}</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Button Area */}
      {questions.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            {/* ... (Same as before) ... */}
            <button
            onClick={handlePublish}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg"
            >
            {saving ? "Creating Test..." : "Publish Test"}
            </button>
        </div>
      )}
    </div>
  )
}