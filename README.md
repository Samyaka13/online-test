# 🎓 Online Assessment Platform

A comprehensive, secure, and AI-enhanced web application for conducting online examinations. The platform features role-based access for **Administrators** (to create tests, manage questions, and view analytics) and **Students** (to take secure, proctored exams).

It uniquely integrates **local AI models (via Transformers.js)** to automatically grade long-answer questions based on semantic similarity.

## 🚀 Features

### 👨‍🎓 Student Portal

* **Secure Authentication**: Register/Login using Email & Password. Access exams via unique **Test IDs**.
* **AI-Powered Grading**:
* Automatically grades **Long Answer Questions** by comparing student responses against a reference answer.
* Uses **Cosine Similarity** on text embeddings to generate a match score (0-100%).


* **Proctoring Suite**:
* **Tab Switch Detection**: Monitors `visibilitychange` events.
* **Auto-Submit**: Automatically finalizes the test after **3 warnings/violations**.
* **FullScreen Enforcement**: Encourages a distraction-free environment.


* **Instant Feedback**:
* Immediate scoring for MCQs.
* Real-time AI analysis for subjective answers.
* Detailed result breakdown (Score, Percentage, and AI Feedback).



### 👩‍🏫 Admin Dashboard

* **Test Management**:
* **Manual Builder**: Create questions one-by-one with specific marking schemes.
* **Bulk Import**: Upload **CSV** or **DOCX** files to create tests in seconds.


* **Live Monitoring**: Track active tests, question counts, and status.
* **Reporting**:
* View global performance reports.
* Access detailed submission logs for every student.



## 🛠️ Tech Stack

**Frontend & Logic**

* **Framework**: [React 19](https://react.dev/) (Vite)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Routing**: React Router DOM 7

**Backend & Data**

* **Database**: [Firebase Firestore](https://firebase.google.com/)
* **Auth**: Firebase Authentication
* **File Parsing**: `papaparse` (CSV), `mammoth` (DOCX)

**AI Grading Service**

* **Runtime**: Node.js / Express
* **ML Library**: [@xenova/transformers](https://huggingface.co/docs/transformers.js/index) (Transformers.js)
* **Model**: `Xenova/all-MiniLM-L6-v2` (Feature Extraction)

## 📂 Project Structure

```bash
src/
├── assets/             # Static assets (images, SVGs)
├── components/         # Shared UI components (QuestionCard, ProtectedRoute)
├── pages/              # Page views
│   ├── AdminPage.jsx        # Dashboard container
│   ├── AdminQuestionForm.jsx # Manual test creator
│   ├── AdminCSVUpload.jsx   # Bulk upload handler
│   ├── TestPage.jsx         # Main exam interface (Student)
│   ├── AdminLogin.jsx       # Admin auth
│   └── ...
├── services/           # Business logic
│   ├── authService.js       # Firebase Auth wrappers
│   ├── firebaseService.js   # Firestore CRUD operations
│   └── ...
├── utils/              # Helpers (CSV parsing, Report generation)
├── server.js           # AI Grading Server (Node.js/Express)
├── App.jsx             # Route definitions
├── firebase.js         # Firebase config
└── main.jsx            # Entry point

```

## ⚙️ Setup & Installation

### 1. Client Setup (Frontend)

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
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```


4. **Run the Frontend**
```bash
npm run dev

```



### 2. Grading Server Setup (Optional / Local)

The project includes a standalone AI grading server in `src/server.js`. By default, the frontend interacts with a hosted version (`https://qna-backend-002j.onrender.com`), but you can run it locally.

1. **Install Server Dependencies**
You may need to install the server-specific packages:
```bash
npm install express cors @xenova/transformers

```


2. **Run the Server**
```bash
node src/server.js

```


*The server will start on `http://localhost:8000` and load the AI model.*
3. **Update Frontend Config**
If running locally, update the fetch URL in `src/pages/TestPage.jsx`:
```javascript
// Change this line:
const response = await fetch("http://localhost:8000/grade", { ... });

```



## 🤖 AI Grading Logic

The grading system uses Semantic Search techniques rather than simple keyword matching:

1. **Embedding Generation**: The system uses `all-MiniLM-L6-v2` to convert both the **Student's Answer** and the **Reference Answer** into high-dimensional vectors.
2. **Cosine Similarity**: It calculates the angle between these two vectors.
* `1.0` = Identical meaning
* `0.0` = No relation


3. **Scoring Algorithm**:
| Similarity Score | Marks Awarded |
| :--- | :--- |
| ≥ 0.90 | 100% (1.0) |
| ≥ 0.80 | 90% (0.9) |
| ≥ 0.70 | 80% (0.8) |
| ... | ... |
| < 0.40 | 0% (0.0) |

## 🛡️ Security & Proctoring

* **Route Protection**: The `/admin` routes are protected by a `ProtectedRoute` component that checks for specific admin credentials/session.
* **Visibility API**: The `TestPage` hooks into the browser's Page Visibility API.
* **Trigger**: User switches tabs or minimizes window.
* **Action**: Increments `tabSwitchCount`.
* **Penalty**: At 3 counts, `handleSubmit()` is forced immediately.



## 📊 Database Schema

**`tests` Collection**

```json
{
  "id": "react-basic-v1",
  "title": "React JS Fundamentals",
  "status": "active",
  "questions": [
    {
      "type": "mcq",
      "questionText": "What is a hook?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    },
    {
      "type": "long",
      "questionText": "Explain Virtual DOM.",
      "referenceAnswer": "The Virtual DOM is a lightweight copy..."
    }
  ]
}

```

**`submissions` Collection**

```json
{
  "testId": "react-basic-v1",
  "userId": "auth_uid_123",
  "detailedAnalysis": {
    "1": { "score": 1, "feedback": "Correct" },
    "2": { "score": 0.8, "feedback": "AI Similarity: 0.75" }
  },
  "calculatedScore": { "correct": 1.8, "total": 2 }
}

```
