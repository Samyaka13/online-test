import { useState } from "react"
import Papa from "papaparse"
import { parseCSVQuestions } from "../utils/parseCSVQuestions"
import { createTest } from "../services/firebaseService"

export default function AdminCSVUpload({ onSuccess }) {
    const [testTitle, setTestTitle] = useState("")
    const [testId, setTestId] = useState("")
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.name.endsWith(".csv")) {
            setFile(selectedFile)
        } else {
            alert("Please select a valid .csv file")
            e.target.value = null
        }
    }

    const handleUpload = async () => {
        // 1. Validation
        if (!testTitle.trim() || !testId.trim()) {
            alert("Please enter a Test Title and Unique Test ID")
            return
        }
        if (!file) {
            alert("Please select a CSV file")
            return
        }

        setUploading(true)

        // 2. Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    if (!results.data.length) {
                        throw new Error("CSV file is empty or missing headers")
                    }

                    // 3. Convert CSV data to Question Objects
                    const questions = parseCSVQuestions(results.data)
                    
                    if (questions.length === 0) {
                        throw new Error("No valid questions found in CSV")
                    }

                    // 4. Create Test in Firebase
                    await createTest(testId, testTitle, questions)
                    
                    alert(`Success! Created test "${testTitle}" with ${questions.length} questions.`)
                    
                    // 5. Reset and Redirect
                    setTestTitle("")
                    setTestId("")
                    setFile(null)
                    if (onSuccess) onSuccess()

                } catch (err) {
                    console.error(err)
                    alert(`Error: ${err.message}`)
                } finally {
                    setUploading(false)
                }
            },
            error: (err) => {
                console.error(err)
                alert("Failed to read CSV file")
                setUploading(false)
            },
        })
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Upload CSV Test</h2>
                    <p className="text-sm text-gray-600">Bulk upload questions from a spreadsheet</p>
                </div>
            </div>

            {/* Metadata Inputs */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Test Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={testTitle}
                        onChange={(e) => setTestTitle(e.target.value)}
                        placeholder="e.g. Python Certification"
                        className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Unique Test ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={testId}
                        onChange={(e) => setTestId(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                        placeholder="e.g. python-cert-2024"
                        className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                    />
                </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all">
                <input
                    type="file"
                    id="csvInput"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label 
                    htmlFor="csvInput" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span className="text-lg font-medium text-gray-700">
                        {file ? file.name : "Click to select CSV file"}
                    </span>
                    <span className="text-sm text-gray-500">
                        {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV files only"}
                    </span>
                </label>
            </div>

            {/* Action Buttons */}
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {uploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Upload & Create Test
                    </>
                )}
            </button>

            {/* CSV Format Guide */}
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <p className="font-bold mb-1">CSV Format Required:</p>
                <p>Headers: <code>type, questionText, optionA, optionB, optionC, optionD, answer</code></p>
                <p className="mt-1 opacity-75">Note: 'type' should be 'mcq' or 'long'. For 'long', options are ignored.</p>
            </div>
        </div>
    )
}