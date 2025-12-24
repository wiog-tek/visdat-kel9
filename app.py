"""
Flask Application Entry Point
Analisis Pengaruh Faktor Lingkungan terhadap Tingkat Keselamatan Jalan di Inggris
Berdasarkan Data UK Co-Benefits Atlas
"""
from flask import Flask, render_template
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import Config
from models.data_loader import DataLoader
from controllers.main_controller import MainController
from controllers.api_controller import APIController

def create_app(config_class=Config):
    """Application factory pattern untuk membuat Flask app"""
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(config_class)
    
    # Initialize data loader
    data_loader = DataLoader()
    
    # Initialize controllers
    main_controller = MainController(data_loader)
    api_controller = APIController(data_loader)
    
    # Register routes
    app.register_blueprint(main_controller.bp)
    app.register_blueprint(api_controller.bp, url_prefix='/api')
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
