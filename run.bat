@echo off
REM Run script for UK Co-Benefits Atlas Dashboard (Windows)

echo Starting UK Co-Benefits Atlas Dashboard...
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo Error: pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)

REM Check if data files exist
if not exist "data\normalized_data.csv" (
    echo Error: normalized_data.csv not found in data\ directory.
    pause
    exit /b 1
)

if not exist "data\lad_boundaries.geojson" (
    echo Error: lad_boundaries.geojson not found in data\ directory.
    pause
    exit /b 1
)

REM Run the application
echo Starting Flask application...
echo Dashboard will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py
