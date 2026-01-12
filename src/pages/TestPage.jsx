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

    // 🔍 CHECK IF ALREADY ATTEMPTED
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
    if (!user) return   // 🔑 THIS FIXES EVERYTHING

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
      <div className="bg-white p-6 rounded shadow text-center w-100">
        <h1 className="text-xl font-bold mb-4 text-red-600">
          Test Already Attempted
        </h1>
        <p className="text-gray-700">
          Our records show that you have already submitted this test.
          Multiple attempts are not allowed.
        </p>
      </div>
    )
  }
  if (showSubmittedScreen) {
    return (
      <div className="bg-white p-8 rounded shadow text-center w-125">
        <h1 className="text-2xl font-bold mb-4">
          Test Submitted ✅
        </h1>
        <p className="mb-6 text-gray-700">
          Thank you, {name}. Your responses have been submitted.
          You may now close this window.
        </p>
        <button
          onClick={() => window.close()}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close Window
        </button>
      </div>
    )
  }

  /* =========================
     Auth Screen
  ========================== */
  if (!user) {
    return (
      <div className="bg-white p-6 rounded shadow w-100 text-center">
        <h1 className="text-xl font-bold mb-4">
          {isLogin ? "Login to Test" : "Register for Test"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 mb-3"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <button
          onClick={handleAuth}
          disabled={authLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {authLoading
            ? "Please wait..."
            : isLogin
              ? "Login"
              : "Register & Start Test"}
        </button>

        <p
          className="text-sm text-blue-600 mt-4 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "New user? Register here"
            : "Already registered? Login"}
        </p>
      </div>
    )
  }

  /* =========================
     Loading / Waiting
  ========================== */
  if (loading) return <p>Loading...</p>

  if (questions.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-2">
          Test not started yet
        </h1>
        <p>Please wait for the admin to upload questions.</p>
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

  /* =========================
     Test UI
  ========================== */
  return (
    
    <div className="bg-white p-6 rounded shadow w-175">
      <div className="w-50 border-r pr-4">
  <h3 className="font-semibold mb-3">Questions</h3>

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
            w-8 h-8 text-sm rounded
            ${isCurrent ? "bg-blue-600 text-white" : ""}
            ${!isCurrent && isAnswered ? "bg-green-500 text-white" : ""}
            ${!isCurrent && !isAnswered ? "bg-gray-200" : ""}
          `}
        >
          {qNo}
        </button>
      )
    })}
  </div>
</div>
      <p className="text-sm text-red-600 mb-2">
        Tab switches remaining:{" "}
        {Math.max(0, MAX_TAB_SWITCHES - tabSwitchCount)}
      </p>

      <div className="mb-4 text-sm text-gray-600">
        Question {currentIndex + 1} of {questions.length}
      </div>

      <h2 className="font-semibold mb-4">
        {currentQuestion.questionText}
      </h2>

      {currentQuestion.type === "mcq" && (
        <div>
          {currentQuestion.options.map((opt, i) => (
            <label key={i} className="block mb-2">
              <input
                type="radio"
                name={`mcq-${questionNumber}`}
                checked={answers[questionNumber] === opt}
                onChange={() => handleMCQChange(opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {currentQuestion.type === "long" && (
        <textarea
          rows={6}
          className="w-full border p-2"
          value={answers[questionNumber] || ""}
          onChange={handleLongChange}
          placeholder="Type your answer here..."
        />
      )}

      <div className="flex justify-between mt-6">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  )
}
