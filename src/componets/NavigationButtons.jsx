export default function NavigationButtons({
  currentIndex,
  total,
  setCurrentIndex,
  onSubmit,
}) {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        disabled={currentIndex === 0}
        onClick={() => setCurrentIndex(currentIndex - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>

      <button
        onClick={() => {
          if (currentIndex < total - 1) {
            setCurrentIndex(currentIndex + 1)
          }
        }}
        className="px-3 py-1 bg-yellow-400 rounded"
      >
        Skip
      </button>

      {currentIndex < total - 1 ? (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      ) : (
        <button
          onClick={onSubmit}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Submit
        </button>
      )}
    </div>
  )
}
