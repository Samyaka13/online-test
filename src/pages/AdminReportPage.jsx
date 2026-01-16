import { useEffect, useState } from "react"
import { getAllTests, getAllSubmissions } from "../services/firebaseService"
import { generateTestReport } from "../utils/generateTestReport"
import { downloadCSV } from "../utils/downloadCSV"

export default function AdminReportPage() {
    const [stats, setStats] = useState({
        totalTests: 0,
        totalQuestions: 0,
        totalSubmissions: 0,
        activeTests: 0
    })
    const [testPerformance, setTestPerformance] = useState([])
    const [recentSubmissions, setRecentSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloadingId, setDownloadingId] = useState(null)

    useEffect(() => {
        fetchReportData()
    }, [])

    const fetchReportData = async () => {
        try {
            const [tests, submissions] = await Promise.all([
                getAllTests(),
                getAllSubmissions()
            ])

            // 1. Calculate Global Stats
            const totalQuestions = tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0)
            const activeTests = tests.filter(t => t.status === 'active').length

            setStats({
                totalTests: tests.length,
                totalQuestions,
                totalSubmissions: submissions.length,
                activeTests
            })

            // 2. Calculate Performance Per Test
            const performanceData = tests.map(test => {
                const testSubs = submissions.filter(s => s.testId === test.id)
                const stats = calculateTestStats(test, testSubs)

                return {
                    ...test,
                    submissionsCount: testSubs.length,
                    questionCount: test.questions?.length || 0,
                    avgScore: stats.avgScore,
                }
            })
            setTestPerformance(performanceData)

            // 3. Recent Submissions (Enriched with Score)
            // Create a lookup map for tests to easily find the questions for a submission
            const testsMap = tests.reduce((acc, t) => {
                acc[t.id] = t
                return acc
            }, {})

            const enrichedSubmissions = submissions
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .slice(0, 10)
                .map(sub => {
                    const test = testsMap[sub.testId]
                    const scoreData = calculateSubmissionScore(sub, test)
                    return { ...sub, scoreData }
                })

            setRecentSubmissions(enrichedSubmissions)

        } catch (err) {
            console.error("Failed to load report data", err)
        } finally {
            setLoading(false)
        }
    }

    // --- Helper 1: Calculate Average for a Test ---
    const calculateTestStats = (test, submissions) => {
        if (!submissions.length || !test.questions) return { avgScore: "N/A" }

        const scorableQuestions = test.questions
            .map((q, index) => ({ ...q, index: index + 1 }))
            .filter(q => q.type === 'mcq' && q.correctAnswer)

        if (scorableQuestions.length === 0) return { avgScore: "N/A" }

        let totalPercentage = 0

        submissions.forEach(sub => {
            let correctCount = 0
            scorableQuestions.forEach(q => {
                const userAns = sub.responses?.[q.index]
                if (userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                    correctCount++
                }
            })
            const subPercentage = (correctCount / scorableQuestions.length) * 100
            totalPercentage += subPercentage
        })

        const avg = totalPercentage / submissions.length
        return { avgScore: `${avg.toFixed(1)}%` }
    }

    // --- Helper 2: Calculate Score for a Single Submission ---
    const calculateSubmissionScore = (sub, test) => {
        if (!test || !test.questions) return null

        let correct = 0
        let total = 0

        test.questions.forEach((q, idx) => {
            if (q.type === 'mcq' && q.correctAnswer) {
                total++
                const userAns = sub.responses?.[idx + 1]
                if (userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                    correct++
                }
            }
        })

        if (total === 0) return null
        
        return {
            correct,
            total,
            percentage: Math.round((correct / total) * 100)
        }
    }

    const handleDownloadReport = async (test) => {
        if (test.submissionsCount === 0) {
            alert("No submissions to download for this test.")
            return
        }
        try {
            setDownloadingId(test.id)
            const allSubs = await getAllSubmissions()
            const testSubs = allSubs.filter(s => s.testId === test.id)
            const reportData = generateTestReport(test.title, test.questions || [], testSubs)
            downloadCSV(reportData, `${test.id}-report-${new Date().toISOString().slice(0,10)}.csv`)
        } catch (err) {
            console.error(err)
            alert("Failed to generate CSV")
        } finally {
            setDownloadingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-500 font-medium">Loading Analytics...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Analytics & Reports</h2>
                    <p className="text-sm text-gray-600">Download reports for specific tests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalSubmissions}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Active Tests</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeTests}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Test Performance Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Test Reports</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Test Title</th>
                                    <th className="p-4 text-center">Avg Score</th>
                                    <th className="p-4 text-center">Submissions</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {testPerformance.map((test) => (
                                    <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900">{test.title}</p>
                                            <p className="text-xs text-gray-500 font-mono">{test.id}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                test.avgScore === 'N/A' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {test.avgScore}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                                {test.submissionsCount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                test.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDownloadReport(test)}
                                                disabled={downloadingId === test.id || test.submissionsCount === 0}
                                                className="text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {downloadingId === test.id ? (
                                                    <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                )}
                                                CSV
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {testPerformance.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            No tests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Recent Activity (Enriched with Scores) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {recentSubmissions.map((sub) => (
                            <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-semibold text-gray-800 text-sm">{sub.name || "Student"}</p>
                                    <span className="text-xs text-gray-400">
                                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ""}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 truncate mb-2" title={sub.email}>
                                    {sub.email}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                                        {sub.testId}
                                    </span>

                                    {/* Score Display */}
                                    {sub.scoreData ? (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                            sub.scoreData.percentage >= 50 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-50 text-red-600'
                                        }`}>
                                            {sub.scoreData.correct}/{sub.scoreData.total} ({sub.scoreData.percentage}%)
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No Score</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}