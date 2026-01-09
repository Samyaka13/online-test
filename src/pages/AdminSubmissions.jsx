import { useEffect, useState } from "react"
import { getSubmissions } from "../services/firebaseService"

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSubmissions()
        setSubmissions(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Loading submissions...</p>

  return (
    <div className="bg-white p-6 rounded shadow w-[800px] max-h-[80vh] overflow-auto">
      <h1 className="text-xl font-bold mb-4">
        Admin – Student Submissions
      </h1>

      {submissions.length === 0 && (
        <p>No submissions yet.</p>
      )}

      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="border rounded p-4 mb-4"
        >
          <p className="text-sm text-gray-600 mb-2">
            Submitted at: {sub.submittedAt}
          </p>

          {Object.entries(sub.responses).map(([qid, answer]) => (
            <div key={qid} className="mb-2">
              <p className="font-semibold">
                Question {qid}
              </p>
              <p className="text-sm">
                {answer}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
