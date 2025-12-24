#!/bin/bash
# Run script for UK Co-Benefits Atlas Dashboard

echo "Starting UK Co-Benefits Atlas Dashboard..."
echo "=========================================="

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "Error: pip is not installed. Please install pip first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies."
    exit 1
fi

# Check if data files exist
if [ ! -f "data/normalized_data.csv" ]; then
    echo "Error: normalized_data.csv not found in data/ directory."
    exit 1
fi

if [ ! -f "data/lad_boundaries.geojson" ]; then
    echo "Error: lad_boundaries.geojson not found in data/ directory."
    exit 1
fi

# Run the application
echo "Starting Flask application..."
echo "Dashboard will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
