"""
Configuration Module
Konfigurasi aplikasi dan path data
"""
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

class Config:
    """Configuration class untuk aplikasi"""
    
    # Flask config
    SECRET_KEY = 'dev-secret-key-change-in-production'
    DEBUG = True
    
    # Data files
    DATA_DIR = BASE_DIR / 'data'
    CSV_FILE = DATA_DIR / 'normalized_data.csv'
    GEOJSON_FILE = DATA_DIR / 'lad_boundaries.geojson'
    
    # Data columns
    LA_COLUMN = 'local_authority'
    YEAR_COLUMN = 'year'
    BENEFIT_TYPE_COLUMN = 'co_benefit_type'
    VALUE_COLUMN = 'value_total'
    
    # GeoJSON matching property
    MATCHING_PROPERTY = 'local_authority'  # Property in GeoJSON to match with local_authority in CSV
    
    # Benefit types configuration
    BENEFIT_TYPES = {
        'air_quality': {
            'label': 'Kualitas Udara',
            'color': '#4CAF50',
            'icon': 'fa-wind',
            'description': 'Manfaat dari peningkatan kualitas udara'
        },
        'congestion': {
            'label': 'Kemacetan',
            'color': '#FF9800',
            'icon': 'fa-traffic-light',
            'description': 'Dampak terhadap tingkat kemacetan lalu lintas'
        },
        'noise': {
            'label': 'Kebisingan',
            'color': '#9C27B0',
            'icon': 'fa-volume-up',
            'description': 'Pengaruh tingkat kebisingan'
        },
        'physical_activity': {
            'label': 'Aktivitas Fisik',
            'color': '#FFC107',
            'icon': 'fa-running',
            'description': 'Manfaat dari peningkatan aktivitas fisik'
        },
        'road_repairs': {
            'label': 'Kondisi Jalan',
            'color': '#2196F3',
            'icon': 'fa-road',
            'description': 'Biaya perbaikan dan kondisi jalan'
        }
    }
    
    # Default selections
    DEFAULT_YEAR = 2025
    DEFAULT_BENEFIT_TYPES = ['air_quality', 'congestion', 'noise', 'physical_activity', 'road_repairs']
    SELECTED_MAP_BENEFIT_TYPE = 'air_quality'  # Single selection for map
