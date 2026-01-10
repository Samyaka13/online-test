import { useState } from "react"
import AdminCSVUpload from "./AdminCSVUpload"
import AdminQuestionForm from "./AdminQuestionForm"
import AdminReportPage from "./AdminReportPage"

export default function AdminPage() {
    const [mode, setMode] = useState("csv") // "csv" | "manual"

    return (
        <div className="space-y-6 bg-white p-6 rounded shadow w-175">
            <h1 className="text-2xl font-bold">
                Admin – Question Paper Setup
            </h1>

            {/* Mode Selector */}
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="mode"
                        value="csv"
                        checked={mode === "csv"}
                        onChange={() => setMode("csv")}
                    />
                    Upload CSV
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="mode"
                        value="manual"
                        checked={mode === "manual"}
                        onChange={() => setMode("manual")}
                    />
                    Add Questions Manually
                </label>
            </div>

            {/* Question Input Section */}
            <div>
                {mode === "csv" && <AdminCSVUpload />}
                {mode === "manual" && <AdminQuestionForm />}
            </div>

            <hr />

            {/* Report Section (always available) */}
            <AdminReportPage />
        </div>
    )
}
