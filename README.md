# StudyFlow — Smart Study Planner

A React/Vite study planner with a FastAPI backend, lecture text extraction for PDF/PPTX, recorded study sessions, and optional local AI chat through Ollama.

## Requirements

- Windows 10/11
- Python 3.11 or newer
- Node.js LTS (includes npm)
- Internet access for the first dependency installation
- Optional: Ollama with `qwen2.5:1.5b` for the local AI assistant

## First-time setup and launch (Windows)

1. Extract the complete ZIP to a normal folder (do not run it from inside the ZIP).
2. Double-click `start_project.bat`.
3. Wait for the Backend and Frontend terminal windows to open.
4. Open `http://127.0.0.1:5173` in your browser.
5. Backend API documentation is at `http://127.0.0.1:8000/docs`.

The first launch creates `.venv`, installs Python requirements, and runs `npm install`. Later launches reuse the installed dependencies.

## Manual launch

Backend terminal:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

Frontend terminal:

```powershell
npm install
npm run dev
```

## Local AI assistant (optional)

Install and start Ollama, then run:

```powershell
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b
```

The rest of the planner, vault text extraction, and study-session endpoints work without Ollama. The AI chat endpoint returns a clear service error if Ollama is not running.

## Notes

- The backend stores uploaded temporary files under `data/uploads` and removes them after extraction.
- Study sessions are saved in `data/processed/study_sessions.csv`.
- PDF text extraction uses PyMuPDF. PPTX text extraction uses python-pptx. Optional PDF OCR uses Tesseract when installed; install the Tesseract application separately and make sure its executable is on PATH (or set `TESSERACT_CMD`). Arabic and English OCR are selected by default (`TESSERACT_LANG=ara+eng`).
- User planner data is stored in browser local storage.

## Checks

```powershell
npm test
npm run build
```
"# numerical-project" 
"# numerical-project" 
"# numerical-project" 
