export default function ResultPage({ score }) {
  return (
    <div className="bg-white p-6 rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Test Completed 🎉</h1>
      <p className="text-lg">Your Score: {score}</p>
    </div>
  )
}
