"use client";

import React, { useState, useEffect } from 'react';

const apiKey = ""; // Provided by execution environment

export default function App() {
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]); 
  const [teachingPlan, setTeachingPlan] = useState("Newton's Laws\nWork, Energy and Power\nMomentum and Impulse\nVertical Projectile Motion\nElectrostatics\nElectric Circuits");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [paperType, setPaperType] = useState('physics');
  const [userApiKey, setUserApiKey] = useState("");
  const [atpFileName, setAtpFileName] = useState("");
  
  // Filtering state
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);

  const CAPS_TARGETS = {
    physics: { 1: 15, 2: 35, 3: 40, 4: 10 },
    chemistry: { 1: 15, 2: 40, 3: 35, 4: 10 },
    math: { 1: 20, 2: 35, 3: 30, 4: 15 }
  };

  const CAPS_LABELS = {
    physics: ["Recall", "Comprehension", "Analysis/Application", "Evaluation/Synthesis"],
    chemistry: ["Recall", "Comprehension", "Analysis/Application", "Evaluation/Synthesis"],
    math: ["Knowledge", "Routine Procedures", "Complex Procedures", "Problem Solving"]
  };

  // Load external parsers dynamically and force global body styles aggressively
  useEffect(() => {
    // Force override Next.js default margins and backgrounds with high priority
    document.documentElement.style.setProperty('background-color', '#050508', 'important');
    document.documentElement.style.setProperty('background-image', 'none', 'important');
    document.body.style.setProperty('background-color', '#050508', 'important');
    document.body.style.setProperty('background-image', 'none', 'important');
    document.body.style.setProperty('margin', '0', 'important');
    document.body.style.setProperty('padding', '0', 'important');

    const scriptPdf = document.createElement('script');
    scriptPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    scriptPdf.async = true;
    scriptPdf.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.body.appendChild(scriptPdf);

    const scriptXlsx = document.createElement('script');
    scriptXlsx.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    scriptXlsx.async = true;
    document.body.appendChild(scriptXlsx);

    const scriptMammoth = document.createElement('script');
    scriptMammoth.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    scriptMammoth.async = true;
    document.body.appendChild(scriptMammoth);
  }, []);

  const processFiles = async (selectedFiles) => {
    setFiles(selectedFiles);
    setImages([]);
    setTexts([]);
    setErrorMsg("");
    
    if (selectedFiles.length === 0) return;
    
    setStatusMsg("[ SYSTEM ]: Processing files...");
    const processedImages = [];
    const processedTexts = [];

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      
      if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext)) {
        const reader = new FileReader();
        const promise = new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
        });
        reader.readAsDataURL(file);
        const base64Img = await promise;
        processedImages.push(base64Img);
      } 
      else if (file.type === 'application/pdf' || ext === 'pdf') {
        if (!window.pdfjsLib) {
          setErrorMsg("ERROR: PDF processor not ready yet. Please try again.");
          setStatusMsg("");
          return;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const base64Img = canvas.toDataURL('image/png');
            processedImages.push(base64Img);
          }
        } catch (err) {
          console.error("PDF processing error:", err);
          setErrorMsg(`ERROR processing PDF: ${err.message}`);
        }
      } 
      else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        if (!window.XLSX) {
          setErrorMsg("ERROR: Excel processor not ready yet.");
          return;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
          let documentText = `[Excel Document: ${file.name}]\n`;
          workbook.SheetNames.forEach(sheetName => {
            documentText += `Sheet: ${sheetName}\n`;
            documentText += window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]) + "\n";
          });
          processedTexts.push(documentText);
        } catch (err) {
          setErrorMsg(`ERROR processing Excel file: ${err.message}`);
        }
      }
      else if (ext === 'docx') {
        if (!window.mammoth) {
          setErrorMsg("ERROR: Word processor not ready yet.");
          return;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          processedTexts.push(`[Word Document: ${file.name}]\n${result.value}`);
        } catch (err) {
          setErrorMsg(`ERROR processing Word file: ${err.message}`);
        }
      }
      else if (ext === 'doc') {
        setErrorMsg(`ERROR: Legacy .doc format cannot be parsed natively. Please use .docx or .pdf.`);
      } 
      else {
        setErrorMsg(`ERROR: Unsupported file type: ${file.name}`);
      }
    }
    
    setImages(processedImages);
    setTexts(processedTexts);
    setStatusMsg("");
  };

  const handleFileChange = (e) => processFiles(Array.from(e.target.files));
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processPlanFiles = async (selectedFiles) => {
    if (selectedFiles.length === 0) return;
    setStatusMsg("[ SYSTEM ]: Extracting plan text...");
    let extractedText = "";

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      try {
        if (file.type === 'application/pdf' || ext === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map(item => item.str).join(' ') + "\n";
          }
        } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
          workbook.SheetNames.forEach(sheetName => {
            extractedText += window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]) + "\n";
          });
        } else if (ext === 'docx') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          extractedText += result.value + "\n";
        } else if (ext === 'txt') {
           const text = await file.text();
           extractedText += text + "\n";
        } else {
           setErrorMsg(`ERROR: Could not extract from ${file.name}.`);
        }
      } catch (err) {
         setErrorMsg(`ERROR reading plan: ${err.message}`);
      }
    }

    if (extractedText.trim()) {
      setTeachingPlan(extractedText.trim());
      setAtpFileName(selectedFiles.map(f => f.name).join(', '));
    }
    setStatusMsg("");
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const analyzePaper = async () => {
    if (!userApiKey && !apiKey) {
      setErrorMsg("ERROR: Missing API Key. Please provide a Gemini API Key in the settings panel.");
      return;
    }
    
    if (images.length === 0 && texts.length === 0) {
      setErrorMsg("ERROR: Upload a paper or document first.");
      return;
    }
    
    setIsAnalyzing(true);
    setErrorMsg("");
    setResults([]);
    setStatusMsg("[ SYSTEM ]: AI Analysis Initialized. Please wait...");

    const targetGrid = CAPS_TARGETS[paperType];
    const currentLabels = CAPS_LABELS[paperType];

    const prompt = `
      You are an expert South African CAPS Curriculum teacher and assessor.
      Analyze the provided exam paper pages (scanned images/PDFs) and/or extracted digital document text.
      Use the provided Teaching Plan topics to categorize each question.
      
      Teaching Plan Topics:
      ${teachingPlan}
      
      Extract a detailed breakdown, question by sub-question.
      For each question (e.g., 1.1, 1.2, 2.1.1), provide:
      - qNum: The specific question number.
      - topic: The closest matching topic from the Teaching Plan. If none match, infer a standard physics/math topic.
      - marks: The marks allocated to this specific question (integer).
      - blooms: The CAPS Cognitive Level (integer 1-4). 
        Level 1: ${currentLabels[0]} (Target ~${targetGrid[1]}% of paper)
        Level 2: ${currentLabels[1]} (Target ~${targetGrid[2]}% of paper)
        Level 3: ${currentLabels[2]} (Target ~${targetGrid[3]}% of paper)
        Level 4: ${currentLabels[3]} (Target ~${targetGrid[4]}% of paper)
      - description: A brief 1-sentence description of what the question asks.
      
      CRITICAL INSTRUCTION: Keep the overall CAPS target weightings in mind. While evaluating each question objectively, be aware that the final distribution of cognitive levels for the paper should roughly align with the target percentages provided above.

      Ensure you analyze ALL provided contexts (images and text) and extract EVERY sub-question found. Be objective.
      
      ${texts.length > 0 ? "\n\nEXTRACTED TEXT FROM DIGITAL DOCUMENTS:\n" + texts.join("\n\n---\n\n") : ""}
    `;

    const imageParts = images.map(imgData => ({
      inlineData: {
        mimeType: "image/png",
        data: imgData.split(',')[1] 
      }
    }));

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              qNum: { type: "STRING" },
              topic: { type: "STRING" },
              marks: { type: "INTEGER" },
              blooms: { type: "INTEGER" },
              description: { type: "STRING" }
            },
            required: ["qNum", "topic", "marks", "blooms", "description"]
          }
        }
      }
    };

    let success = false;
    let finalError = "";
    
    // STRICT TRIM: Removes invisible spaces that break the URL and cause 404 errors
    const activeKey = (userApiKey || apiKey).trim();
    
    // SMART FALLBACK: Google's endpoint availability varies depending on your region and account age.
    const modelsToTry = userApiKey
      ? [
          "gemini-2.5-flash",
          "gemini-2.0-flash"
        ]
      : ["gemini-2.5-flash", "gemini-2.0-flash"];

    for (const modelEndpoint of modelsToTry) {
      if (success) break;
      
      let attempt = 0;
      while (attempt < 3 && !success) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${activeKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }
          );

          if (!response.ok) {
            const errBody = await response.json().catch(() => null);
            const errDetail = errBody?.error?.message || response.statusText;
            if (response.status === 404) throw new Error("MODEL_404");
            if (response.status === 429) throw new Error(`AI quota reached: ${errDetail}`);
            if (response.status === 403) throw new Error(`API Error 403: ${errDetail}`);
            if (response.status === 400) throw new Error(`API Error 400: ${errDetail}`);
            throw new Error(`API Error ${response.status}: ${errDetail}`);
          }

          const data = await response.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (textResponse) {
            const parsedData = JSON.parse(textResponse);
            setResults(parsedData);
            success = true;
          } else {
            throw new Error("Invalid response format from AI.");
          }
        } catch (err) {
          if (err.message === "MODEL_404") {
            finalError = `ERROR: Model ${modelEndpoint} not found.`;
            break;
          }
          if (err.message.startsWith("AI quota reached")) {
            finalError = err.message;
            break;
          }

          attempt++;
          finalError = err.message;
          if (attempt < 3) await delay(2000 * attempt); // Backoff
        }
      }
    }

    setIsAnalyzing(false);
    setStatusMsg("");

    if (!success) {
      setErrorMsg(finalError || "ERROR: Could not connect to Gemini AI. Please check your API key.");
    }
  };

  const totalMarks = results.reduce((sum, q) => sum + (q.marks || 0), 0);
  
  const getMarksByLevel = () => {
    const levels = { 1: 0, 2: 0, 3: 0, 4: 0 };
    results.forEach(q => {
      if (q.blooms >= 1 && q.blooms <= 4) {
        levels[q.blooms] += (q.marks || 0);
      }
    });
    return levels;
  };

  const uniqueTopics = [...new Set(results.map(q => q.topic))];
  
  const toggleTopic = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const toggleLevel = (level) => {
    setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };

  const filteredQuestions = results.filter(q => {
    const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(q.topic);
    const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(q.blooms);
    return topicMatch && levelMatch;
  });

  const generateRevisionPlan = () => {
    if (filteredQuestions.length === 0) return "";
    const qNumbers = filteredQuestions.map(q => q.qNum).join(", ");
    return `[ ACTION PLAN ]: Focus revision on questions: ${qNumbers}.`;
  };

  return (
    <div className="cyber-root" style={{ position: 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', backgroundColor: '#050508', backgroundImage: 'none', margin: 0, padding: 0, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Import Outfit for a distinct, geometric, incredibly modern cyber look */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        /* Target global html, body, and Next.js root element */
        html, body, #__next {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #050508 !important;
          background-image: none !important;
          width: 100%;
          height: 100%;
        }

        * {
          box-sizing: border-box;
        }

        .cyber-root {
          /* Enforce dark background on the outermost wrapper to prevent white flashes or body overrides */
          background-color: #050508 !important;
          background-image: none !important;
          min-height: 100vh;
          width: 100%;
          color: #ffffff;
          font-family: 'Outfit', system-ui, -apple-system, sans-serif; /* CHANGED TO OUTFIT */
          padding-bottom: 4rem;
          line-height: 1.5;
        }

        .cyber-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        /* --- Typography & Hero (Matching Image) --- */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 9999px;
          padding: 6px 14px;
          color: #06b6d4;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          background: rgba(6, 182, 212, 0.05);
          font-family: 'SF Mono', 'Courier New', Courier, monospace; /* Keeping badge cyber style */
        }
        .status-badge .dot {
          width: 6px;
          height: 6px;
          background-color: #06b6d4;
          border-radius: 50%;
          box-shadow: 0 0 8px #06b6d4;
        }

        .hero-title {
          font-family: system-ui, -apple-system, sans-serif; /* PROTECTED TITLE FONT */
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 2rem 0;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
        }

        .text-white { color: #ffffff; }
        .text-magenta { 
          color: #d946ef; 
          text-shadow: 0 0 25px rgba(217, 70, 239, 0.4); 
        }
        .text-cyan { 
          color: #06b6d4; 
          text-shadow: 0 0 25px rgba(6, 182, 212, 0.4); 
        }

        .hero-subtitle {
          color: #a1a1aa;
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 3rem;
          border-left: 2px solid #d946ef;
          padding-left: 1.25rem;
          max-width: 600px;
        }

        /* --- Grid Layout --- */
        .grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 992px) {
          .grid-container { grid-template-columns: 1fr 2fr; }
        }

        /* --- Panels & Boxes --- */
        .cyber-panel {
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid #1f1f2e;
          padding: 1.5rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }
        .panel-title {
          font-size: 0.85rem;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 1.25rem;
          letter-spacing: 1px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'SF Mono', 'Courier New', Courier, monospace; /* Keeping panel headers cyber style */
        }

        /* --- Inputs & Uploads --- */
        .upload-zone {
          border: 1px dashed #2d2d3b;
          background: rgba(255, 255, 255, 0.01);
          padding: 2.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }
        .upload-zone:hover, .upload-zone.drag-active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
        }
        .upload-text {
          font-size: 0.85rem;
          color: #06b6d4;
          display: block;
          margin-bottom: 0.75rem;
          font-family: 'SF Mono', 'Courier New', Courier, monospace;
        }
        .upload-subtext {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 300;
        }

        .cyber-input {
          width: 100%;
          background: #050508;
          border: 1px solid #2d2d3b;
          color: #ffffff;
          font-family: 'Outfit', system-ui, sans-serif;
          padding: 0.85rem;
          font-size: 0.9rem;
          font-weight: 400;
          border-radius: 6px;
          box-sizing: border-box;
          margin-bottom: 1rem;
          transition: border-color 0.2s ease;
        }
        .cyber-input:focus {
          outline: none;
          border-color: #d946ef;
        }
        textarea.cyber-input {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        /* --- Buttons --- */
        .btn-outline {
          background: transparent;
          border: 1px solid #06b6d4;
          color: #06b6d4;
          font-family: 'Outfit', system-ui, sans-serif;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-outline:hover:not(:disabled) {
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        .btn-outline:disabled {
          border-color: #2d2d3b;
          color: #64748b;
          cursor: not-allowed;
        }
        
        .btn-small {
          background: transparent;
          border: 1px solid #2d2d3b;
          color: #a1a1aa;
          font-family: 'Outfit', system-ui, sans-serif;
          padding: 0.35rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        .btn-small:hover {
          color: #ffffff;
          border-color: #ffffff;
        }
        .btn-small.active-topic {
          border-color: #d946ef;
          color: #d946ef;
          background: rgba(217, 70, 239, 0.1);
        }
        .btn-small.active-level {
          border-color: #06b6d4;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
        }

        /* --- Dashboard Metrics --- */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(5, 1fr); }
        }
        .metric-card {
          background: rgba(10, 10, 15, 0.8);
          border: 1px solid #1f1f2e;
          padding: 1.25rem 1rem;
          text-align: center;
          border-radius: 6px;
        }
        .metric-card.off-target {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.75rem;
          display: block;
        }
        .metric-value {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }
        .metric-value span {
          font-size: 0.8rem;
          font-weight: 400;
          color: #64748b;
        }
        .progress-bar {
          background: #1f1f2e;
          height: 4px;
          width: 100%;
          border-radius: 2px;
          position: relative;
          margin-top: 0.5rem;
        }
        .progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: #06b6d4;
          border-radius: 2px;
        }
        .metric-card.off-target .progress-fill { background: #ef4444; }
        .progress-target {
          position: absolute;
          top: -2px;
          bottom: -2px;
          width: 2px;
          background: #ffffff;
          z-index: 10;
        }
        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.5rem;
          color: #64748b;
        }

        /* --- Table --- */
        .table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .cyber-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .cyber-table th {
          color: #64748b;
          font-weight: 600;
          text-align: left;
          padding: 1rem;
          border-bottom: 1px solid #2d2d3b;
        }
        .cyber-table td {
          padding: 1rem;
          border-bottom: 1px solid #1f1f2e;
          color: #e2e8f0;
          vertical-align: top;
          font-weight: 300;
        }
        .cyber-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .level-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border: 1px solid #2d2d3b;
          border-radius: 4px;
          background: #050508;
          color: #a1a1aa;
        }

        /* --- Utility --- */
        .status-msg {
          font-size: 0.85rem;
          font-weight: 500;
          color: #06b6d4;
          margin-top: 1rem;
          text-align: center;
          font-family: 'SF Mono', 'Courier New', Courier, monospace;
        }
        .error-msg {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ef4444;
          border: 1px solid #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 1rem;
          margin-top: 1rem;
          border-radius: 6px;
        }
        .flex-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
        .info-box {
          background: #050508;
          border: 1px solid #2d2d3b;
          padding: 1.25rem;
          border-radius: 6px;
        }
      ` }} />

      <div className="cyber-layout">
        <header>
          <div className="status-badge">
            <span className="dot"></span> READY TO ANALYZE
          </div>
          <h1 className="hero-title">
            <span className="text-magenta">ASSESSMENT</span> <span className="text-cyan">ANALYSER</span>
          </h1>
          <div className="hero-subtitle">
            An intelligent curriculum-aligned parser that evaluates<br/>
            cognitive levels automatically. Upload it, analyze it,<br/>
            review it—no manual grading required.
          </div>
        </header>

        <main className="grid-container">
          
          {/* Left Column: Inputs */}
          <div className="input-column">
            
            {/* Upload Panel */}
            <div className="cyber-panel">
              <h2 className="panel-title">// ASSESSMENT UPLOAD</h2>
              <div 
                className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  accept=".pdf, .png, .jpg, .jpeg, .doc, .docx, .xls, .xlsx, .csv, application/pdf, image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <span className="upload-text">GET STARTED &rarr;</span>
                  <span className="upload-subtext">Click or drag PDF, PNG, DOCX, XLSX here</span>
                </label>
              </div>
              
              {files.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500, color: '#06b6d4' }}>
                  {'>'} {files.length} FILE(S) QUEUED ({images.length} PAGES, {texts.length} DOCS)
                </div>
              )}
            </div>

            {/* Settings Panel */}
            <div className="cyber-panel">
              <div className="panel-title">
                <span>// ATP UPLOAD</span>
                <input 
                  type="file" 
                  id="plan-upload" 
                  accept=".pdf, .doc, .docx, .xls, .xlsx, .csv, .txt"
                  style={{ display: 'none' }}
                  onChange={(e) => processPlanFiles(Array.from(e.target.files))}
                />
                <label htmlFor="plan-upload" className="btn-small">
                  [+ LOAD ATP]
                </label>
              </div>
              {atpFileName && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#06b6d4' }}>
                  {'>'} ATP LOADED: {atpFileName}
                </div>
              )}
              
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                GEMINI_API_KEY:
              </label>
              <input 
                type="password"
                className="cyber-input"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="Enter Gemini API Key..."
              />
              
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                TARGET_MATRIX:
              </label>
              <select 
                className="cyber-input"
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
              >
                <option value="physics">PHYSICAL SCIENCES - P1 (PHYSICS)</option>
                <option value="chemistry">PHYSICAL SCIENCES - P2 (CHEMISTRY)</option>
                <option value="math">MATHEMATICS (P1 & P2)</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                CURRICULUM_TOPICS:
              </label>
              <textarea 
                className="cyber-input"
                value={teachingPlan}
                onChange={(e) => setTeachingPlan(e.target.value)}
                placeholder="Enter topics..."
              />
            </div>

            <button 
              onClick={analyzePaper}
              disabled={isAnalyzing || (images.length === 0 && texts.length === 0)}
              className="btn-outline"
            >
              {isAnalyzing ? '[ PROCESSING... ]' : 'START ANALYSIS \u2192'}
            </button>

            {statusMsg && <div className="status-msg">{statusMsg}</div>}
            {errorMsg && <div className="error-msg">{errorMsg}</div>}

          </div>

          {/* Right Column: Dashboard */}
          <div className="dashboard-column">
            {results.length === 0 && !isAnalyzing ? (
              <div className="cyber-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ color: '#64748b', marginBottom: '1rem', letterSpacing: '2px', fontFamily: "'SF Mono', 'Courier New', Courier, monospace" }}>
                  [ AWAITING INPUT DATA ]
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: 300 }}>
                  Upload an assessment on the left to generate the cognitive mapping grid.
                </p>
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card" style={{ borderColor: '#d946ef', boxShadow: '0 0 10px rgba(217, 70, 239, 0.1)' }}>
                    <span className="metric-label">TOTAL_MARKS</span>
                    <div className="metric-value" style={{ color: '#d946ef' }}>{totalMarks}</div>
                  </div>
                  
                  {[1, 2, 3, 4].map(level => {
                    const marks = getMarksByLevel()[level];
                    const percentage = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;
                    const target = CAPS_TARGETS[paperType][level];
                    const diff = percentage - target;
                    const isOffTarget = Math.abs(diff) > 5 && totalMarks > 0; 
                    const label = CAPS_LABELS[paperType][level-1];
                    
                    return (
                      <div key={level} className={`metric-card ${isOffTarget ? 'off-target' : ''}`}>
                        <span className="metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          L{level}: {label.split('/')[0]}
                        </span>
                        <div className="metric-value">{marks} <span>pts</span></div>
                        
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                          <div className="progress-target" style={{ left: `${target}%` }}></div>
                        </div>
                        
                        <div className="progress-text">
                          <span>TGT:{target}%</span>
                          <span style={{ color: isOffTarget ? '#ef4444' : '#e2e8f0' }}>ACT:{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table */}
                <div className="cyber-panel">
                  <h2 className="panel-title">// PARSED_DATA_GRID</h2>
                  <div className="table-container">
                    <table className="cyber-table">
                      <thead>
                        <tr>
                          <th>Q#</th>
                          <th>TOPIC</th>
                          <th>PTS</th>
                          <th>LVL</th>
                          <th>DESCRIPTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((q, idx) => (
                          <tr key={idx}>
                            <td style={{ color: '#ffffff', fontWeight: 600 }}>{q.qNum}</td>
                            <td>{q.topic}</td>
                            <td style={{ color: '#06b6d4', fontWeight: 700 }}>{q.marks}</td>
                            <td><span className="level-badge">L{q.blooms}</span></td>
                            <td style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.5' }}>{q.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Weak Areas */}
                <div className="cyber-panel">
                  <h2 className="panel-title">// TARGETED_REVISION_GENERATOR</h2>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
                      FILTER_BY_TOPIC:
                    </div>
                    <div className="flex-wrap">
                      {uniqueTopics.map(topic => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`btn-small ${selectedTopics.includes(topic) ? 'active-topic' : ''}`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem', marginTop: '1rem' }}>
                      FILTER_BY_LEVEL:
                    </div>
                    <div className="flex-wrap">
                      {[1, 2, 3, 4].map(level => (
                        <button
                          key={level}
                          onClick={() => toggleLevel(level)}
                          className={`btn-small ${selectedLevels.includes(level) ? 'active-level' : ''}`}
                        >
                          LEVEL {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="info-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#06b6d4', letterSpacing: '1px' }}>OUTPUT:</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generateRevisionPlan());
                          setStatusMsg("[ SYSTEM ]: Copied to clipboard!");
                          setTimeout(() => setStatusMsg(""), 3000);
                        }}
                        className="btn-small"
                      >
                        [ COPY ]
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', fontWeight: 300 }}>
                      {generateRevisionPlan() || "Select filters above to isolate questions for targeted revision."}
                    </p>
                  </div>
                </div>

              </>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
