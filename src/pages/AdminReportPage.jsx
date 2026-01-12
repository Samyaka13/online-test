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
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Test Reports
                    </h2>
                    <p className="text-sm text-gray-600">Download submission data and analytics</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Export Submission Data
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Download a comprehensive CSV report containing all test submissions, user details, and responses. Perfect for analysis and record-keeping.
                        </p>
                        
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Preparing Report...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    <span>Download CSV Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            
        </div>
    )
}