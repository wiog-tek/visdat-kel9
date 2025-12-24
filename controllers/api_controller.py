"""
API Controller
Menangani API endpoints untuk data visualization
"""
from flask import Blueprint, jsonify, request
import pandas as pd


class APIController:
    """Controller untuk API endpoints"""
    
    def __init__(self, data_loader):
        """Initialize controller dengan data loader"""
        self.data_loader = data_loader
        self.bp = Blueprint('api', __name__)
        self._register_routes()
    
    def _register_routes(self):
        """Register all API routes"""
        self.bp.add_url_rule('/geojson', 'geojson', self.get_geojson, methods=['GET'])
        self.bp.add_url_rule('/map-data', 'map_data', self.get_map_data, methods=['GET'])
        self.bp.add_url_rule('/chart-data', 'chart_data', self.get_chart_data, methods=['GET'])
        self.bp.add_url_rule('/correlation', 'correlation', self.get_correlation, methods=['GET'])
        self.bp.add_url_rule('/trend-data', 'trend_data', self.get_trend_data, methods=['GET'])
        self.bp.add_url_rule('/heatmap-data', 'heatmap_data', self.get_heatmap_data, methods=['GET'])
        self.bp.add_url_rule('/summary-stats', 'summary_stats', self.get_summary_stats, methods=['GET'])
        self.bp.add_url_rule('/top-areas', 'top_areas', self.get_top_areas, methods=['GET'])
        self.bp.add_url_rule('/aggregated-data', 'aggregated_data', self.get_aggregated_data, methods=['GET'])
    
    def get_geojson(self):
        """Get GeoJSON data"""
        try:
            return jsonify(self.data_loader.geojson)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_map_data(self):
        """Get data for map visualization"""
        try:
            year = int(request.args.get('year', 2025))
            benefit_type = request.args.get('benefit_type', 'air_quality')

            # Get data for the selected benefit type
            data = self.data_loader.get_data_for_map(year, benefit_type)

            return jsonify({
                'success': True,
                'data': data
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_chart_data(self):
        """Get time series data for charts"""
        try:
            local_authority = request.args.get('local_authority')
            if not local_authority:
                return jsonify({
                    'success': False,
                    'error': 'local_authority parameter required'
                }), 400
            
            benefit_types = request.args.getlist('benefit_types')
            if not benefit_types:
                benefit_types = None
            
            data = self.data_loader.get_data_for_chart(local_authority, benefit_types)
            
            return jsonify({
                'success': True,
                'data': data,
                'local_authority': local_authority
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_correlation(self):
        """Get correlation matrix between benefit types"""
        try:
            year = request.args.get('year', type=int)
            
            corr_data = self.data_loader.get_correlation_data(year)
            
            return jsonify({
                'success': True,
                'data': corr_data,
                'year': year
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_trend_data(self):
        """Get trend data for specific local authority"""
        try:
            local_authority = request.args.get('local_authority')
            if not local_authority:
                return jsonify({
                    'success': False,
                    'error': 'local_authority parameter required'
                }), 400
            
            data = self.data_loader.get_trend_data(local_authority)
            
            return jsonify({
                'success': True,
                'data': data,
                'local_authority': local_authority
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_heatmap_data(self):
        """Get heatmap data"""
        try:
            benefit_type = request.args.get('benefit_type', 'air_quality')
            year_start = request.args.get('year_start', type=int)
            year_end = request.args.get('year_end', type=int)
            
            data = self.data_loader.get_heatmap_data(benefit_type, year_start, year_end)
            
            return jsonify({
                'success': True,
                'data': data,
                'benefit_type': benefit_type
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_summary_stats(self):
        """Get summary statistics"""
        try:
            stats = self.data_loader.get_summary_statistics()
            
            return jsonify({
                'success': True,
                'data': stats
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_top_areas(self):
        """Get top N areas for a benefit type"""
        try:
            benefit_type = request.args.get('benefit_type', 'air_quality')
            year = int(request.args.get('year', 2025))
            n = int(request.args.get('n', 10))
            order = request.args.get('order', 'desc')  # 'desc' or 'asc'
            
            ascending = order == 'asc'
            
            data = self.data_loader.get_top_areas(benefit_type, year, n, ascending)
            
            return jsonify({
                'success': True,
                'data': data,
                'benefit_type': benefit_type,
                'year': year
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
    
    def get_aggregated_data(self):
        """Get aggregated data by grouping"""
        try:
            group_by = request.args.get('group_by', 'nation')
            
            data = self.data_loader.get_aggregated_data(group_by)
            
            return jsonify({
                'success': True,
                'data': data,
                'group_by': group_by
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
