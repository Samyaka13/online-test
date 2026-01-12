import { useState } from "react"
import { clearQuestions, saveQuestions, setTestStatus } from "../services/firebaseService"

export default function AdminQuestionForm() {
  const [type, setType] = useState("mcq")
  const [questionText, setQuestionText] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)

  /* =========================
     Add Question Locally
  ========================== */
  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert("Question is required")
      return
    }

    if (type === "mcq" && options.some(o => !o.trim())) {
      alert("All 4 options are required")
      return
    }

    const newQuestion = {
      id: Date.now(),
      type,
      questionText,
      options: type === "mcq" ? options : [],
    }

    setQuestions(prev => [...prev, newQuestion])

    setQuestionText("")
    setOptions(["", "", "", ""])
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
    if (questions.length === 0) {
      alert("Add at least one question before publishing")
      return
    }

    try {
      setSaving(true)

      // 🔒 lock test
      await setTestStatus("uploading")

      // 🔥 replace paper
      await clearQuestions()
      await saveQuestions(questions)

      // ✅ unlock test
      await setTestStatus("ready")

      alert("Question paper published successfully")
      setQuestions([])
    } catch (err) {
      console.error(err)
      alert("Failed to publish question paper")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Create Questions</h2>
          <p className="text-sm text-gray-600">Add questions one by one to build your test</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options
          </label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="relative">
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
            ))}
          </div>
        </div>
      )}

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Question to List
      </button>

      {/* Preview Added Questions */}
      {questions.length > 0 && (
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Question Preview
            </h3>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all bg-linear-to-br from-white to-gray-50">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">
                        {q.questionText}
                      </p>
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                        q.type === "mcq" 
                          ? "bg-blue-50 text-blue-700" 
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {q.type === "mcq" ? "Multiple Choice" : "Long Answer"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove question"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                {q.type === "mcq" && (
                  <div className="ml-11 mt-3 space-y-1">
                    {q.options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Button */}
      {questions.length > 0 && (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">
                Ready to Publish?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Publishing will make this question paper live for all students. Any existing questions will be replaced.
              </p>
              
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Publish Question Paper</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}