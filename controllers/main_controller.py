"""
Main Controller
Menangani routing untuk halaman utama
"""
from flask import Blueprint, render_template
from config import Config


class MainController:
    """Controller untuk main routes"""
    
    def __init__(self, data_loader):
        """Initialize controller dengan data loader"""
        self.data_loader = data_loader
        self.bp = Blueprint('main', __name__)
        self._register_routes()
    
    def _register_routes(self):
        """Register all main routes"""
        self.bp.add_url_rule('/', 'index', self.index, methods=['GET'])
    
    def index(self):
        """Main dashboard page"""
        # Get metadata for template
        years = self.data_loader.get_years()
        local_authorities = self.data_loader.get_local_authorities()
        benefit_types = self.data_loader.get_benefit_types()
        nations = self.data_loader.get_nations()
        
        # Get benefit type configurations
        benefit_configs = Config.BENEFIT_TYPES
        
        return render_template(
            'index.html',
            min_year=min(years),
            max_year=max(years),
            years=years,
            local_authorities=local_authorities,
            benefit_types=benefit_types,
            benefit_configs=benefit_configs,
            nations=nations,
            default_year=Config.DEFAULT_YEAR,
            selected_map_benefit_type=Config.SELECTED_MAP_BENEFIT_TYPE,
            matching_property=Config.MATCHING_PROPERTY
        )
