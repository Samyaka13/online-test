import { useEffect, useState, useCallback } from "react"
import { getTestMetadata, hasUserAlreadyAttempted, saveSubmission } from "../services/firebaseService"
import { registerUser, loginUser } from "../services/authService"

export default function TestPage() {
  /* =========================
     Auth & Test Setup State
  ========================== */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [testId, setTestId] = useState("") 
  
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [alreadyAttempted, setAlreadyAttempted] = useState(false)

  /* =========================
     Test Taking State
  ========================== */
  const [currentTest, setCurrentTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  
  const [submitted, setSubmitted] = useState(false)
  const [grading, setGrading] = useState(false) // NEW: To show grading spinner
  const [showSubmittedScreen, setShowSubmittedScreen] = useState(false)
  
  const [finalScore, setFinalScore] = useState(null)

  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const MAX_TAB_SWITCHES = 3

  /* =========================
     Auth & Start Test Handler
  ========================== */
  const handleAuth = async () => {
    if (!email || !password || !testId || (!isLogin && !name)) {
      alert("Please fill all required fields, including Test ID")
      return
    }

    try {
      setAuthLoading(true)
      const testData = await getTestMetadata(testId)
      
      const firebaseUser = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password)

      const attempted = await hasUserAlreadyAttempted(email, testId)

      if (attempted) {
        setAlreadyAttempted(true)
        setUser(firebaseUser)
        return
      }

      setUser(firebaseUser)
      setCurrentTest(testData)
      setQuestions(testData.questions || [])
      setLoading(false)

    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  /* =========================
     Submit & AI Grading Handler
  ========================== */
  const handleSubmit = useCallback(async () => {
    if (submitted || !user) return

    try {
      setSubmitted(true)
      setGrading(true) // Start Grading Phase

      let totalScore = 0
      let maxScore = 0
      const detailedAnalysis = {} // Store per-question results

      // Process all questions (Async for AI Grading)
      await Promise.all(questions.map(async (q, index) => {
        const qNum = index + 1
        const userAns = answers[qNum] || ""
        
        // Initialize metadata for this question
        detailedAnalysis[qNum] = {
            type: q.type,
            score: 0,
            maxScore: 1,
            feedback: "Not Answered"
        }

        if (q.type === 'mcq') {
           maxScore += 1
           if (q.correctAnswer && userAns) {
              if (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                 totalScore += 1
                 detailedAnalysis[qNum].score = 1
                 detailedAnalysis[qNum].feedback = "Correct"
              } else {
                 detailedAnalysis[qNum].feedback = "Incorrect"
              }
           }
        } 
        else if (q.type === 'long') {
           maxScore += 1
           // Only call AI if we have both a user answer and a reference answer
           if (userAns.trim() && q.referenceAnswer) {
              try {
                  // Call our local Node.js backend
                  const response = await fetch("http://localhost:8000/grade", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                          student_answer: userAns, 
                          reference_answer: q.referenceAnswer 
                      })
                  })

                  if (response.ok) {
                      const data = await response.json()
                      // Add decimal marks (e.g., 0.8)
                      totalScore += data.marks_out_of_1
                      detailedAnalysis[qNum].score = data.marks_out_of_1
                      detailedAnalysis[qNum].feedback = `AI Similarity: ${data.similarity}`
                  } else {
                      detailedAnalysis[qNum].feedback = "AI Error"
                  }
              } catch (err) {
                  console.error("Grading failed for Q" + qNum, err)
                  detailedAnalysis[qNum].feedback = "Grading Server Unavailable"
              }
           }
        }
      }))

      // Prepare Final Data
      const finalResult = {
          correct: Number(totalScore.toFixed(1)), // Handle decimals
          total: maxScore
      }
      setFinalScore(finalResult)

      // Save to Firebase
      await saveSubmission({
        testId: testId,
        userId: user.uid,
        name: name || user.email,
        email: user.email,
        responses: answers,
        calculatedScore: finalResult,
        detailedAnalysis: detailedAnalysis // Saving the full AI breakdown
      })
      
      setGrading(false)
      setShowSubmittedScreen(true)

    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit test. Please check your connection.")
      setGrading(false)
      setSubmitted(false) // Allow retry
    }
  }, [answers, submitted, user, name, testId, questions])

  /* =========================
     Tab Switch Detection
  ========================== */
  useEffect(() => {
    if (!user || submitted || alreadyAttempted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, submitted, alreadyAttempted])

  /* =========================
     Auto Submit on Limit
  ========================== */
  useEffect(() => {
    if (tabSwitchCount >= MAX_TAB_SWITCHES && !submitted && user && !alreadyAttempted) {
      alert("You have switched tabs too many times. The test will now be submitted.")
      handleSubmit()
    }
  }, [tabSwitchCount, handleSubmit, submitted, user, alreadyAttempted])

  /* =========================
     RENDER: Screens
  ========================== */
  
  // 1. Grading / Loading Screen
  if (grading) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Grading Assessment...</h2>
                <p className="text-gray-600">Our AI is analyzing your long-form answers.</p>
                <p className="text-sm text-gray-400 mt-2">Please do not close this window.</p>
            </div>
        </div>
      )
  }

  // 2. Already Attempted
  if (alreadyAttempted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Test Already Attempted</h1>
          <p className="text-gray-600">You have already submitted <strong>{testId}</strong>.</p>
        </div>
      </div>
    )
  }

  // 3. Success / Result Screen
  if (showSubmittedScreen) {
    const percentage = finalScore?.total > 0 
      ? Math.round((finalScore.correct / finalScore.total) * 100) 
      : 0

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg w-full border-t-4 border-green-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Result Generated!</h1>
          
          {finalScore && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-green-800 font-medium uppercase tracking-wide mb-1">Total Score</p>
              <div className="text-5xl font-extrabold text-green-600 mb-2">
                {percentage}%
              </div>
              <p className="text-green-700 text-lg">
                <strong>{finalScore.correct}</strong> / {finalScore.total} Marks
              </p>
              <p className="text-xs text-green-600 mt-2 opacity-75">
                (Includes AI grading for long answers)
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // 4. Login Screen
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-indigo-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Student Login" : "Student Registration"}
            </h1>
            <p className="text-gray-600 text-sm">
              Enter the Test ID provided by your instructor.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Test ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. react-final-2024"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="w-full border-2 border-indigo-100 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
            />
          </div>

          {!isLogin && (
            <div className="mb-4 ">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? "Verifying..." : "Start Test"}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              {isLogin ? "New user? Register here" : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 5. Loading (Fetching Questions)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
             <p className="text-gray-500">Loading Question Paper...</p>
        </div>
      </div>
    )
  }

  // 6. Test Interface (Main)
  if (questions.length === 0) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <div className="text-center max-w-md p-6 bg-white shadow-lg rounded-xl">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Empty Test</h2>
                 <p className="text-gray-500">This test ID exists but contains no questions. Please contact your administrator.</p>
                 <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
             </div>
        </div>
     )
  }

  const currentQuestion = questions[currentIndex]
  const questionNumber = currentIndex + 1

  const handleMCQChange = (value) => {
    setAnswers({ ...answers, [questionNumber]: value })
  }

  const handleLongChange = (e) => {
    setAnswers({ ...answers, [questionNumber]: e.target.value })
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-indigo-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                 {currentTest?.title || "Assessment Portal"}
              </h1>
              <p className="text-gray-600 text-sm">
                 Candidate: <span className="font-semibold">{name || user?.email}</span> | Test ID: <span className="font-mono bg-gray-100 px-1 rounded">{testId}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Progress:</span>
                <span className="text-sm font-bold text-indigo-600">{answeredCount}/{questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm font-medium text-red-600">
                  Warnings left: {Math.max(0, MAX_TAB_SWITCHES - tabSwitchCount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Question Navigator */}
          <div className="w-80 bg-white rounded-xl shadow-lg p-6 hidden md:block">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
              Questions
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const qNo = idx + 1
                const isAnswered = answers[qNo] !== undefined
                const isCurrent = currentIndex === idx
                return (
                  <button
                    key={qNo}
                    onClick={() => setCurrentIndex(idx)}
                    className={`
                      w-10 h-10 text-sm font-medium rounded-lg transition-all 
                      ${isCurrent ? "bg-indigo-600 text-white shadow-lg scale-110" : ""}
                      ${!isCurrent && isAnswered ? "bg-green-500 text-white hover:bg-green-600" : ""}
                      ${!isCurrent && !isAnswered ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : ""}
                    `}
                  >
                    {qNo}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question Panel */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                  Question {questionNumber}
                </span>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase">
                  {currentQuestion.type === "mcq" ? "Multiple Choice" : "Long Answer"}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="mb-8 min-h-[200px]">
              {currentQuestion.type === "mcq" && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`
                        flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                        ${answers[questionNumber] === opt
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`q-${questionNumber}`}
                        checked={answers[questionNumber] === opt}
                        onChange={() => handleMCQChange(opt)}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "long" && (
                <textarea
                  rows={8}
                  className="w-full border-2 border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  value={answers[questionNumber] || ""}
                  onChange={handleLongChange}
                  placeholder="Type your answer here..."
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}