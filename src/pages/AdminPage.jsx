import { useState, useEffect } from "react";
import AdminQuestionForm from "./AdminQuestionForm";
import AdminCSVUpload from "./AdminCSVUpload";
import AdminReportPage from "./AdminReportPage";
import { getAllTests } from "../services/firebaseService";

export default function AdminPage() {
  // Views: "dashboard" | "create-manual" | "create-csv" | "reports"
  const [view, setView] = useState("dashboard");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch list of tests on mount or when returning to dashboard
  useEffect(() => {
    if (view === "dashboard") {
      loadTests();
    }
  }, [view]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await getAllTests();
      setTests(data);
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Manage assessments and view reports</p>
          </div>

          {/* Action Buttons */}
          {view === "dashboard" ? (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setView("reports")} 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                View Global Reports
              </button>
              <button 
                onClick={() => setView("create-csv")} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                Upload CSV
              </button>
              <button 
                onClick={() => setView("create-manual")} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                New Test
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setView("dashboard")} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
            </button>
          )}
        </div>

        {/* VIEW: DASHBOARD (List of Tests) */}
        {view === "dashboard" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">Uploaded Tests</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                Loading tests...
              </div>
            ) : tests.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No tests created yet</h3>
                <p className="text-gray-500 mt-1">Get started by creating a new test or uploading a CSV.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold">Test Title</th>
                      <th className="p-4 font-semibold">Test ID</th>
                      <th className="p-4 font-semibold">Questions</th>
                      <th className="p-4 font-semibold">Created At</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{test.title || "Untitled Test"}</td>
                        <td className="p-4 font-mono text-sm">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                            {test.id}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{test.questionCount}</td>
                        <td className="p-4 text-gray-500">
                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            test.status === 'active' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {test.status ? test.status.toUpperCase() : "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CREATE MANUAL */}
        {view === "create-manual" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <AdminQuestionForm onSuccess={() => { setView("dashboard"); loadTests(); }} />
          </div>
        )}

        {/* VIEW: CREATE CSV */}
        {view === "create-csv" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <AdminCSVUpload onSuccess={() => { setView("dashboard"); loadTests(); }} />
          </div>
        )}

        {/* VIEW: REPORTS */}
        {view === "reports" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <AdminReportPage />
          </div>
        )}

      </div>
    </div>
  );
}