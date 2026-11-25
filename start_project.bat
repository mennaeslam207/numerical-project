@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo        STUDYFLOW - SMART STUDY PLANNER
echo ============================================

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.11 or newer and try again.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js LTS and try again.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv .venv
  if errorlevel 1 goto failed
)

echo Installing backend requirements...
call ".venv\Scripts\python.exe" -m pip install --upgrade pip
call ".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto failed

echo Installing frontend requirements...
call npm install
if errorlevel 1 goto failed

start "StudyFlow Backend" cmd /k "cd /d ""%~dp0"" && ""%~dp0.venv\Scripts\python.exe"" -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"
timeout /t 3 /nobreak >nul
start "StudyFlow Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev -- --host 127.0.0.1"

echo.
echo StudyFlow is starting.
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:8000/docs
echo.
echo For AI chat, start Ollama and run: ollama run qwen2.5:1.5b
echo.
exit /b 0

:failed
echo.
echo Setup failed. Check the error above, then run start_project.bat again.
pause
exit /b 1
