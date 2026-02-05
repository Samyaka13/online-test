import express from 'express';
import cors from 'cors';
import { pipeline, env } from '@xenova/transformers';

// Configuration: Skip local model checks to speed up startup
env.allowLocalModels = false;
env.useBrowserCache = false;

const app = express();
app.use(cors());
app.use(express.json());

// Global variable for the model
let extractor = null;

// 1. Load the Model on Startup
console.log("Loading AI Model (Xenova/all-MiniLM-L6-v2)...");
// We use 'feature-extraction' to get the raw embeddings (vectors)
pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    .then(model => {
        extractor = model;
        console.log("✅ Model loaded successfully!");
    })
    .catch(err => console.error("❌ Failed to load model:", err));

// --- Helper: Cosine Similarity ---
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// --- Helper: Grading Logic ---
function calculateMarks(similarity) {
    if (similarity >= 0.90) return 1.0;
    if (similarity >= 0.80) return 0.9;
    if (similarity >= 0.70) return 0.8;
    if (similarity >= 0.60) return 0.7;
    if (similarity >= 0.50) return 0.5;
    if (similarity >= 0.40) return 0.4;
    return 0.0;
}

// 2. The Grading Endpoint
app.post('/grade', async (req, res) => {
    if (!extractor) {
        return res.status(503).json({ error: "Model is still loading, please wait..." });
    }

    try {
        const { student_answer, reference_answer } = req.body;

        if (!student_answer || !reference_answer) {
            return res.status(400).json({ error: "Missing student_answer or reference_answer" });
        }

        // Generate embeddings for both texts
        // pooling: 'mean' and normalize: true ensures we get a single, comparable vector for each sentence
        const output = await extractor([student_answer, reference_answer], { pooling: 'mean', normalize: true });

        // The output is a Tensor. We convert it to a standard JS array.
        // output[0] is student vector, output[1] is reference vector
        const studentVector = Array.from(output[0].data);
        const referenceVector = Array.from(output[1].data);

        // Calculate Similarity
        const similarity = cosineSimilarity(studentVector, referenceVector);
        
        // Calculate Marks
        const marks = calculateMarks(similarity);

        res.json({
            similarity: parseFloat(similarity.toFixed(3)),
            marks_out_of_1: marks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal grading error" });
    }
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log("AI Grading Server running on http://localhost:${PORT}");
});
