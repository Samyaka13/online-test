
# 🎓 Online Assessment Platform (Frontend)

A modern, secure, and feature-rich React application for conducting online examinations. This platform supports both **Multiple Choice Questions (MCQs)** and **Long Answer Questions** with AI-powered grading integration. It features separate interfaces for Administrators (to manage tests and view results) and Students (to attempt exams with proctoring measures).

## 🚀 Features

### 👨‍🎓 Student Portal

* **Secure Authentication**: Students register or login using their Email and a unique **Test ID** provided by the admin.
* **AI-Powered Grading**: Long-answer questions are automatically graded against a reference answer using an external AI service, providing similarity scores and feedback.
* **Proctoring & Security**:
* **Tab Switch Detection**: Monitors focus visibility. Warns the user on tab switches and automatically submits the test after **3 violations**.
* **FullScreen Mode**: Optimized for distraction-free assessment.


* **Instant Results**: Calculates scores immediately (MCQ logic + AI analysis) and displays a detailed breakdown upon submission.
* **Prevention of Re-attempts**: Checks database to ensure a student cannot attempt the same Test ID twice.

### 👩‍🏫 Admin Dashboard

* **Test Management**:
* **Manual Creation**: Form-based builder to add questions one by one.
* **Bulk Upload**: Import questions via **CSV** or **DOCX** files (using `papaparse` and `mammoth`).


* **Monitoring**: View a list of all active tests, their unique IDs, and status.
* **Analytics & Reports**: View global reports and detailed student submission data stored in Firebase.

## 🛠️ Tech Stack

* **Framework**: [React](https://react.dev/) (Vite)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
* **Icons**: [Lucide React](https://lucide.dev/)
* **File Handling**:
* `papaparse` (CSV Parsing)
* `mammoth` (DOCX Parsing)


* **AI Integration**: Connects to an external Python/Node backend for LLM-based answer grading.

## 📂 Project Structure

```
src/
├── assets/          # Static images and assets
├── components/      # Reusable UI components (QuestionCard, ProtectedRoute, etc.)
├── pages/           # Main Application Pages
│   ├── AdminPage.jsx       # Main Admin Dashboard
│   ├── AdminLogin.jsx      # Admin Authentication
│   ├── AdminQuestionForm.jsx # Manual Test Creation
│   ├── AdminCSVUpload.jsx    # Bulk Upload via CSV
│   ├── TestPage.jsx        # Main Student Testing Interface
│   └── ...
├── services/        # API and Firebase interaction logic
│   ├── authService.js      # Login/Register wrappers
│   └── firebaseService.js  # Firestore CRUD operations
├── utils/           # Helper functions (CSV parsing, Report generation)
├── App.jsx          # Routing (React Router)
├── firebase.js      # Firebase Configuration
└── main.jsx         # Entry point

```

## ⚙️ Setup & Installation

1. **Clone the repository**
```bash
git clone <repository_url>
cd online-test

```


2. **Install dependencies**
```bash
npm install

```


3. **Configure Firebase**
* Create a project at [Firebase Console](https://console.firebase.google.com/).
* Enable **Authentication** (Email/Password) and **Firestore Database**.
* Create a `.env` file in the root directory (or update `src/firebase.js` directly if testing locally) with your credentials:


```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```


4. **Run the application**
```bash
npm run dev

```



## 📊 Database Schema (Firestore)

The application relies on two main collections:

1. **`tests`** (Created by Admin)
* `id` (Document ID): Unique Test ID (e.g., "react-101")
* `title`: Test Name
* `questions`: Array of objects `{ type, questionText, options, correctAnswer, referenceAnswer }`
* `status`: "active" | "closed"


2. **`submissions`** (Created by Student)
* `testId`: Reference to the Test ID
* `userId`: Student's Auth ID
* `responses`: Map of Question Number -> User Answer
* `calculatedScore`: `{ correct: number, total: number }`
* `detailedAnalysis`: AI feedback per question



## 🤖 AI Grading Integration

The `TestPage.jsx` component is configured to send long-answer responses to an external backend for grading.

* **Current Endpoint**: `https://qna-backend-002j.onrender.com/grade`
* **Payload**: `{ student_answer, reference_answer }`
* **Response**: `{ marks_out_of_1, similarity }`

## 🛡️ Security Features

* **ProtectedRoute**: Ensures only authenticated admins can access the dashboard.
* **Visibility API**: The `TestPage` listens for `visibilitychange` events. If a student switches tabs or minimizes the browser **3 times**, the test is auto-submitted.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

**Note**: Ensure your Firestore security rules allow read/write access appropriate for your development or production environment.
