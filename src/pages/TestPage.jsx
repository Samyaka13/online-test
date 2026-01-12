import { useEffect, useState, useCallback } from "react"
import { getQuestions, saveSubmission } from "../services/firebaseService"
import { registerUser, loginUser } from "../services/authService"
import { getTestStatus } from "../services/firebaseService"
import { hasUserAlreadyAttempted } from "../services/firebaseService"

export default function TestPage() {
  /* =========================
     Auth State
  ========================== */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [alreadyAttempted, setAlreadyAttempted] = useState(false)
  /* =========================
     Test State
  ========================== */
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showSubmittedScreen, setShowSubmittedScreen] = useState(false)

  /* =========================
     Tab Switch Control
  ========================== */
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const MAX_TAB_SWITCHES = 3

  /* =========================
     Auth Handler
  ========================== */
  const handleAuth = async () => {
    if (!email || !password || !name) {
      alert("Please fill all required fields")
      return
    }

    try {
      setAuthLoading(true)

      const firebaseUser = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password)

      const attempted = await hasUserAlreadyAttempted(
        email,
        "dice-assessment-v1"
      )

      if (attempted) {
        setAlreadyAttempted(true)
        return
      }

      setUser(firebaseUser)
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  /* =========================
     Fetch Questions
  ========================== */
  useEffect(() => {
    if (!user) return

    let interval

    async function checkStatus() {
      const status = await getTestStatus()

      if (status === "ready") {
        clearInterval(interval)
        const data = await getQuestions()
        setQuestions(data)
        setLoading(false)
      }
    }

    setLoading(true)
    checkStatus()
    interval = setInterval(checkStatus, 3000)

    return () => clearInterval(interval)
  }, [user])

  /* =========================
     Submit Handler
  ========================== */
  const handleSubmit = useCallback(async () => {
    if (submitted || !user) return

    try {
      setSubmitted(true)
      await saveSubmission({
        testId: "dice-assessment-v1",
        userId: user.uid,
        name,
        email,
        responses: answers,
      })
      setShowSubmittedScreen(true)
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit test")
    }
  }, [answers, submitted, user, name, email])

  /* =========================
     Tab Switch Detection
  ========================== */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      )
    }
  }, [])

  /* =========================
     Auto Submit on Limit
  ========================== */
  useEffect(() => {
    if (tabSwitchCount === MAX_TAB_SWITCHES) {
      alert(
        "You have switched tabs 3 times. The test will now be submitted."
      )
      handleSubmit()
    }
  }, [tabSwitchCount, handleSubmit])

  /* =========================
     Submitted Screen
  ========================== */
  if (alreadyAttempted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-800">
            Test Already Attempted
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Our records show that you have already submitted this test. Multiple attempts are not allowed.
          </p>
        </div>
      </div>
    )
  }

  if (showSubmittedScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg w-full border-t-4 border-green-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Test Submitted Successfully
          </h1>
          <p className="mb-8 text-gray-600 text-lg">
            Thank you, <span className="font-semibold text-gray-800">{name}</span>. Your responses have been recorded and submitted successfully.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Close Window
          </button>
        </div>
      </div>
    )
  }

  /* =========================
     Auth Screen
  ========================== */
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-indigo-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back" : "Assessment Registration"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isLogin ? "Sign in to continue your test" : "Create an account to begin the assessment"}
            </p>
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Register & Start Test"}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              {isLogin
                ? "New user? Register here"
                : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* =========================
     Loading / Waiting
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-amber-500">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-800 text-center">
            Assessment Not Available
          </h1>
          <p className="text-gray-600 text-center">Please wait for the administrator to upload questions and start the test.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const questionNumber = currentIndex + 1

  /* =========================
     Answer Handlers
  ========================== */
  const handleMCQChange = (value) => {
    const questionNumber = currentIndex + 1
    setAnswers({
      ...answers,
      [questionNumber]: value,
    })
  }

  const handleLongChange = (e) => {
    const questionNumber = currentIndex + 1
    setAnswers({
      ...answers,
      [questionNumber]: e.target.value,
    })
  }

  const answeredCount = Object.keys(answers).length

  /* =========================
     Test UI
  ========================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-indigo-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Assessment Portal</h1>
              <p className="text-gray-600 text-sm">Welcome, {name}</p>
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
                  Tab switches remaining: {Math.max(0, MAX_TAB_SWITCHES - tabSwitchCount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Question Navigator */}
          <div className="w-80 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Question Navigator
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
                      w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm mb-3">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                <span className="text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-3 text-sm mb-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  currentQuestion.type === "mcq" 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-purple-50 text-purple-700"
                }`}>
                  {currentQuestion.type === "mcq" ? "Multiple Choice" : "Long Answer"}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="mb-8">
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
                        name={`mcq-${questionNumber}`}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
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