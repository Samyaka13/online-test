export default function QuestionCard({
  question,
  selected,
  onSelect,
  index,
}) {
  return (
    <div>
      <h2 className="font-bold mb-4">
        Q{index + 1}. {question.question}
      </h2>

      {question.options.map((opt, i) => (
        <label key={i} className="block mb-2">
          <input
            type="radio"
            name="option"
            value={i + 1}
            checked={selected === i + 1}
            onChange={() => onSelect(i + 1)}
            className="mr-2"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}
