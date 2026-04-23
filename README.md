Assessment Analysis 💻

Intelligent Curriculum & Cognitive Level Mapping for South African Educators

Assessment Analysis is an AI-powered tool designed to help South African teachers effortlessly review and audit exam papers. By uploading an assessment, the tool automatically parses the document, categorizes questions by curriculum topics, and maps them to standard CAPS Cognitive Levels (Bloom's Taxonomy).

✨ Key Features

Multi-Format Support & OCR: Upload scanned exam papers (Images, PDFs) or digital documents (Word, Excel). The tool handles text extraction and Optical Character Recognition automatically.

Secure API Key Handling: Provide your own free Google Gemini API key directly in the user interface. The key is kept safely in your browser's temporary memory and is never saved to your public repository.

Custom Teaching Plans (ATP): Upload your term's Annual Teaching Plan (or type it in manually) so the AI can accurately categorize questions based on what you have taught.

CAPS Cognitive Grid Auditing: Select your subject (Physical Sciences P1/P2 or Mathematics) to load official CAPS target weightings. The dashboard visually flags if your paper is too heavily weighted towards lower or higher cognitive levels (alerts trigger at >5% deviation).

Question-by-Question Breakdown: Get a detailed table showing question numbers, matched topics, mark allocations, and cognitive levels.

Targeted Revision Generator: Filter the results by specific topics or cognitive levels where your class struggled, and instantly copy a targeted revision question list to share with learners.

🛠️ Tech Stack

Frontend: React & Next.js (Static Export)

Styling: Custom "Cyber" CSS Theme (Self-contained, no external CSS frameworks required)

AI Engine: Google Gemini 2.5 Flash (Multimodal Vision & Text)

Document Parsing:

pdf.js (PDF handling & rendering)

mammoth.js (Word/Docx extraction)

SheetJS (Excel/CSV extraction)

🚀 How to Use

Upload a Paper: Drag and drop your exam paper into the // ASSESSMENT UPLOAD zone.

Set the Target: Choose the subject paper type (e.g., Mathematics or Physics) from the settings dropdown to load the correct cognitive level labels and target percentages.

Provide API Key: Paste your Google Gemini API Key into the GEMINI_API_KEY input field. (Get one for free at Google AI Studio).

Provide Topics: Upload your teaching plan document or paste your topics directly into the CURRICULUM_TOPICS text box.

Analyze: Click "START ANALYSIS" to send the documents to the AI.

Review: Review the summary dashboard to see if the paper aligns with curriculum standards, and use the breakdown table to audit individual questions.

💻 Deployment & GitHub Pages

This application is configured to automatically deploy to GitHub Pages using a custom GitHub Actions workflow.

Every time you push changes to the main branch, the workflow will automatically:

Install Next.js dependencies (npm install)

Auto-generate the correct next.config.js to match your repository name

Build a static HTML export (npm run build)

Deploy the ./out folder directly to GitHub Pages

📄 License

This project is licensed under the MIT License.
