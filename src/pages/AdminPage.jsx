import { useState } from "react"
import AdminCSVUpload from "./AdminCSVUpload"
import AdminQuestionForm from "./AdminQuestionForm"
import AdminReportPage from "./AdminReportPage"

export default function AdminPage() {
    const [mode, setMode] = useState("csv") // "csv" | "manual"

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-gray-600">Question Paper Setup & Management</p>
                        </div>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Questions
                    </h2>

                    <div className="flex gap-4">
                        <label
                            className={`
                                flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                ${mode === "csv"
                                    ? "border-indigo-600 bg-indigo-50"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="mode"
                                value="csv"
                                checked={mode === "csv"}
                                onChange={() => setMode("csv")}
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <span className="font-medium text-gray-700">Upload CSV</span>
                            </div>
                        </label>

                        <label
                            className={`
                                flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                ${mode === "manual"
                                    ? "border-indigo-600 bg-indigo-50"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="mode"
                                value="manual"
                                checked={mode === "manual"}
                                onChange={() => setMode("manual")}
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span className="font-medium text-gray-700">Add Manually</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Question Input Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {mode === "csv" && <AdminCSVUpload />}
                    {mode === "manual" && <AdminQuestionForm />}
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-linear-to-br from-slate-50 to-slate-100 px-4 text-sm text-gray-500 font-medium">
                            Reports & Analytics
                        </span>
                    </div>
                </div>

                {/* Report Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <AdminReportPage />
                </div>
            </div>
        </div>
    )
}