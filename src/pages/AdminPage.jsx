import { useRef, useState } from "react"
import Papa from "papaparse"
import { saveQuestionsToFirebase } from "../services/firebaseService"
import { Upload, File, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react"

export default function AdminPage() {
    const fileInputRef = useRef(null)
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    // when user selects a file
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setStatus(`Selected file: ${selectedFile.name}`)
        }
    }

    // open file picker
    const openFilePicker = () => {
        fileInputRef.current.click()
    }

    const handleUpload = () => {
        if (!file) {
            setStatus("❌ Please select a CSV file first")
            return
        }

        setIsUploading(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const questions = results.data.map((row) => ({
                        question: row.question,
                        options: [
                            row.option1,
                            row.option2,
                            row.option3,
                            row.option4,
                        ],
                        correctOption: Number(row.correct_option),
                    }))

                    await saveQuestionsToFirebase(questions)
                    setStatus("✅ Questions uploaded successfully")
                    setIsUploading(false)
                } catch (err) {
                    console.error(err)
                    setStatus("❌ Upload failed")
                    setIsUploading(false)
                }
            },
        })
    }

    const getStatusIcon = () => {
        if (status.includes("✅")) return <CheckCircle className="w-5 h-5 text-green-500" />
        if (status.includes("❌")) return <XCircle className="w-5 h-5 text-red-500" />
        return <File className="w-5 h-5 text-blue-500" />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <FileSpreadsheet className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>
                    <p className="text-blue-100 text-sm">Upload questions from CSV file</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Hidden input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Upload Area */}
                    <div 
                        onClick={openFilePicker}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 mb-6"
                    >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-1">
                            {file ? file.name : "Click to select CSV file"}
                        </p>
                        <p className="text-gray-400 text-sm">
                            or drag and drop
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={openFilePicker}
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <File className="w-4 h-4" />
                            Choose File
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {getStatusIcon()}
                            <p className="text-sm text-gray-700 flex-1">
                                {status.replace(/[✅❌]/g, '').trim()}
                            </p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-800 font-medium mb-2">📋 CSV Format Requirements:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Headers: question, option1, option2, option3, option4, correct_option</li>
                            <li>• correct_option should be a number (1-4)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}