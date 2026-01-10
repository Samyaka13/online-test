import { useState } from "react"
import {
    getAllQuestions,
    getAllSubmissions,
} from "../services/firebaseService"
import { generateAdminReport } from "../utils/generateAdminReport"
import { downloadCSV } from "../utils/downloadCSV"

export default function AdminReportPage() {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)

            const submissions = await getAllSubmissions()

            const report = generateAdminReport(submissions)

            downloadCSV(
                report,
                `test-report-${new Date().toISOString()}.csv`
            )
        } catch (err) {
            console.error(err)
            alert("Failed to generate report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded shadow w-125">
            <h2 className="text-xl font-bold mb-4">
                Download Test Report
            </h2>

            <button
                onClick={handleDownload}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? "Preparing..." : "Download CSV Report"}
            </button>
        </div>
    )
}
