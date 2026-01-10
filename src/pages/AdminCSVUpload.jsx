import Papa from "papaparse"
import { parseCSVQuestions } from "../utils/parseCSVQuestions"
import { clearQuestions, saveQuestions, setTestStatus } from "../services/firebaseService"

export default function AdminCSVUpload() {
    const handleCSVUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.name.endsWith(".csv")) {
            alert("Please upload a CSV file")
            return
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    if (!results.data.length) {
                        throw new Error("CSV file is empty")
                    }

                    const questions = parseCSVQuestions(results.data)
                    await setTestStatus("uploading")
                    // 🔥 Replace old paper
                    await clearQuestions()
                    await saveQuestions(questions)
                    await setTestStatus("ready")
                    alert(
                        `Uploaded ${questions.length} questions. Test is live.`
                    )
                } catch (err) {
                    console.error(err)
                    alert(err.message)
                }
            },
            error: (err) => {
                console.error(err)
                alert("Failed to parse CSV")
            },
        })
    }

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Upload Question CSV</h2>
            <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
            />
        </div>
    )
}
