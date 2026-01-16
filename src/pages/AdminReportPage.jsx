import { useEffect, useState } from "react"
import { getAllTests, getAllSubmissions } from "../services/firebaseService"
import { generateTestReport } from "../utils/generateTestReport" // Response CSV
import { generateMarksReport } from "../utils/generateMarksReport" // Marks CSV
import { downloadCSV } from "../utils/downloadCSV"

export default function AdminReportPage() {
    const [allTests, setAllTests] = useState([])
    const [allSubmissions, setAllSubmissions] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedTest, setSelectedTest] = useState(null) // null = Show Test List, Object = Show Student List
    console.log(selectedTest)
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [tests, submissions] = await Promise.all([
                getAllTests(),
                getAllSubmissions()
            ])
            setAllTests(tests)
            setAllSubmissions(submissions)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // --- Helpers ---
    const getSubmissionsForTest = (testId) => {
        return allSubmissions.filter(s => s.testId === testId)
    }

    const calculateAvgScore = (testId) => {
        const subs = getSubmissionsForTest(testId)
        if (!subs.length) return "N/A"

        let totalPercent = 0
        let count = 0
        subs.forEach(s => {
            if (s.calculatedScore && s.calculatedScore.total > 0) {
                totalPercent += (s.calculatedScore.correct / s.calculatedScore.total) * 100
                count++
            }
        })
        return count === 0 ? "N/A" : `${(totalPercent / count).toFixed(1)}%`
    }

    // --- Download Actions ---
    const handleDownloadResponses = (submission) => {
        const data = generateTestReport(selectedTest.title, selectedTest.questions, [submission])
        console.log("Data",data)
        downloadCSV(data, `${submission.name}-responses.csv`)
    }

    const handleDownloadMarks = (submission) => {
        const data = generateMarksReport(selectedTest.title, selectedTest.questions, [submission])
        downloadCSV(data, `${submission.name}-marks.csv`)
    }

    // --- NEW: Bulk Download for Current View ---
    const handleBulkDownload = (type) => {
        const subs = getSubmissionsForTest(selectedTest.id)
        if (type === 'responses') {
            const data = generateTestReport(selectedTest.title, selectedTest.questions, subs)
            downloadCSV(data, `${selectedTest.id}-all-responses.csv`)
        } else {
            const data = generateMarksReport(selectedTest.title, selectedTest.questions, subs)
            downloadCSV(data, `${selectedTest.id}-all-marks.csv`)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Data...</div>

    // ==========================================
    // VIEW 2: STUDENT LIST (Detailed View)
    // ==========================================
    if (selectedTest) {
        const submissions = getSubmissionsForTest(selectedTest.id)
        console.log("submissions",submissions) 

        return (
            <div className="space-y-6">
                {/* Back Button & Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedTest(null)}
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedTest.title}</h2>
                            <p className="text-sm text-gray-500">Showing {submissions.length} submissions</p>
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex gap-2">
                         <button onClick={() => handleBulkDownload('responses')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded text-sm font-medium hover:bg-indigo-100">
                            Download All Responses
                         </button>
                         <button onClick={() => handleBulkDownload('marks')} className="bg-green-50 text-green-700 px-4 py-2 rounded text-sm font-medium hover:bg-green-100">
                            Download All Marks
                         </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="p-4">Student Name</th>
                                <th className="p-4">Email ID</th>
                                <th className="p-4 text-center">Total Score</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{sub.name}</td>
                                    <td className="p-4 text-gray-600">{sub.email}</td>
                                    <td className="p-4 text-center">
                                        {sub.calculatedScore ? (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                (sub.calculatedScore.correct / sub.calculatedScore.total) >= 0.5 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                                {sub.calculatedScore.correct} / {sub.calculatedScore.total}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">--</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleDownloadResponses(sub)}
                                            className="text-xs border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-50 transition"
                                        >
                                            Responses CSV
                                        </button>
                                        <button 
                                            onClick={() => handleDownloadMarks(sub)}
                                            className="text-xs border border-green-200 text-green-700 px-3 py-1.5 rounded hover:bg-green-50 transition"
                                        >
                                            Marks CSV
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400">No submissions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    // ==========================================
    // VIEW 1: TEST LIST (Main Dashboard)
    // ==========================================
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Analytics & Reports</h2>
                    <p className="text-sm text-gray-600">Select a test to view student performance</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTests.map(test => {
                    const submissionCount = getSubmissionsForTest(test.id).length
                    return (
                        <div 
                            key={test.id} 
                            onClick={() => setSelectedTest(test)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">{test.id}</span>
                                </div>
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Submissions</p>
                                    <p className="text-lg font-bold text-gray-800">{submissionCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Avg Score</p>
                                    <p className="text-lg font-bold text-green-600">{calculateAvgScore(test.id)}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}