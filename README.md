Assessment Analysis 🎓

Intelligent Curriculum & Cognitive Level Mapping for South African Educators

Assessment Analysis is an AI-powered tool designed to help South African teachers effortlessly review and audit exam papers. By uploading an assessment, the tool automatically parses the document, categorizes questions by curriculum topics, and maps them to standard CAPS Cognitive Levels (Bloom's Taxonomy).

✨ Key Features

Multi-Format Support & OCR: Upload scanned exam papers (Images, PDFs) or digital documents (Word, Excel). The tool handles text extraction and Optical Character Recognition automatically.

Custom Teaching Plans: Upload your term's Teaching Plan (or type it in manually) so the AI can accurately categorize questions based on what you have taught.

CAPS Cognitive Grid Auditing: Select your subject (Physical Sciences P1/P2 or Mathematics) to load official CAPS target weightings. The dashboard visually flags if your paper is too heavily weighted towards lower or higher cognitive levels (alerts trigger at >5% deviation).

Question-by-Question Breakdown: Get a detailed table showing question numbers, matched topics, mark allocations, and cognitive levels.

Targeted Revision Generator: Filter the results by specific topics or cognitive levels where your class struggled, and instantly copy a targeted revision question list to share with learners.

🛠️ Tech Stack

Frontend: React, Tailwind CSS

Icons: Lucide React

AI Engine: Google Gemini 2.5 Flash (Multimodal Vision & Text)

Document Parsing:

pdf.js (PDF handling & rendering)

mammoth.js (Word/Docx extraction)

SheetJS (Excel/CSV extraction)

🚀 How to Use

Upload a Paper: Drag and drop your exam paper into the upload zone.

Set the Target: Choose the subject paper type (e.g., Mathematics or Physics) from the settings dropdown to load the correct cognitive level labels and target percentages.

Provide Topics: Upload your teaching plan document or paste your topics directly into the text box.

Analyze: Click "Analyze Paper" to send the documents to the AI.

Review: Review the summary dashboard to see if the paper aligns with curriculum standards, and use the breakdown table to audit individual questions.

💻 Setup for Local Development

To run this project locally:

Clone the repository:

git clone [https://github.com/yourusername/assessment-analysis.git](https://github.com/yourusername/assessment-analysis.git)


Navigate to the project directory:

cd assessment-analysis


Install dependencies (assuming you are using a bundler like Vite or Create React App):

npm install


API Key Setup: You will need a Google Gemini API key. Ensure you securely provide this key to the application (e.g., via environment variables).

Start the development server:

npm start


📄 License

This project is licensed under the MIT License.
