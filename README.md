# Recov.ai: AI-Powered Recovery & Medication Assistant

## Overview

Recov.ai is an innovative platform that utilizes the power of Artificial Intelligence to assist users in their physical recovery journey and medication adherence. It addresses the challenges of accessing personalized exercise guidance, understanding complex medical reports, and maintaining consistent medication schedules.

## Key Features

*   **AI-Driven Physical Therapy Assistant:**
    *   Provides personalized exercise plans and real-time feedback using pose estimation technology.
*   **AI Report Analysis:**
    *   Intelligently analyzes uploaded medical reports to extract key insights and actionable health information.
*   **Smart Medication Reminders:**
    *   Leverages OCR and AI to extract medication details from prescriptions, generating personalized reminders.

## Tech Stack

*   **Frontend:**
    *   Next.js (v15.2.1)
    *   TypeScript
    *   Tailwind CSS
    *   Radix UI (UI components)
    *   Framer Motion (animations)
*   **Backend & AI:**
    *   Firebase (Authentication, Storage, Firestore)
    *   TensorFlow.js (@tensorflow-models/posenet)
    *   Google Gemini Models (via `@ai-sdk/google` and `ai`)
    *   Pinecone (vector database)
    *   pdf-parse and pdfjs-dist (PDF processing)
    *    tesseract.js (OCR)
    *   NVIDIA API for embeddings.
*   **Other:**
    *   PostCSS, ESLint

## Functionality

1.  **User Authentication:** Secure user authentication using Firebase Authentication with Google Sign-In.

2.  **File Upload & Processing:**
    *   Users can upload medical reports (PDFs, images) and prescriptions.
    *   Uploaded files are stored in Firebase Storage.
    *   OCR (Tesseract.js) is used to extract text from images and PDFs.

3.  **AI-Powered Analysis:**
    *   Extracted text is sent to Google Gemini models for analysis.
    *   The AI generates actionable health insights from medical reports.
    *   For medication reminders, the AI extracts structured information from prescriptions (medication name, dosage, frequency, time of day, etc.).
    *   NVIDIA API is used to generate embeddings
    *   Embeddings are stored in Pinecone for fast semantic similarity searches.

4.  **Pose Detection & Physical Therapy:**
    *   TensorFlow.js and PoseNet are used to track user movements in real-time.
    *   Provides feedback on exercise form and progress.

5.  **Smart Reminders:**
    *   Medication data is stored in Firebase Firestore.
    *   A scheduling system (likely using Firebase Cloud Functions or similar) sends timely medication reminders to the user.

6.  **Chat Interface:**
    *   Users can ask questions about their medical reports.
    *   The chat model (powered by Gemini) retrieves relevant documents from Pinecone (vector database) based on the query.

## API Endpoints

*   `/api/chat`: Handles user queries and generates AI-powered responses.
*   `/api/medicinereminders`: Extracts structured medication data from uploaded prescriptions.
*   `/api/reportanalysis`: Analyzes medical reports and stores health insights.
*   `/api/reportupload`: Uploads medical reports to Firebase Storage.
*   `/api/store-prescription`: Stores structured prescription data.
*   `/api/upload`: Handles file uploads to Firebase Storage.

## Key Components

*   `app/components/Cards.tsx`: Displays service cards.
*   `app/components/FileExtract.tsx`: Extracts text from uploaded files.
*   `app/components/Hero.tsx`: Hero section of the landing page.
*   `app/components/SideBar.tsx`: Navigation sidebar.
*   `app/components/Uploadfile.tsx`: Handles file uploads.
*   `app/therapy/hooks/usePoseDetection.ts`: Implements pose detection logic.
*   `context/AuthContext.tsx`: Manages user authentication state.
*   `app/dashboard/page.tsx`: Dashboard page

## Future Enhancements

*   Integration with wearable devices for activity tracking.
*   Expansion of the exercise library and personalization of therapy plans.
*   Deeper AI insights and predictive health recommendations.
*   Telehealth functionality for remote consultations.