"""
Data Loader Model
Menangani loading dan caching data dari CSV dan GeoJSON
"""
import pandas as pd
import json
from pathlib import Path
from functools import lru_cache
from config import Config


class DataLoader:
    """Class untuk memuat dan mengelola data"""
    
    def __init__(self):
        """Initialize data loader dengan path dari config"""
        self.config = Config
        self._data = None
        self._geojson = None
    
    @property
    def data(self):
        """Load data CSV dengan caching"""
        if self._data is None:
            self._data = self._load_csv_data()
        return self._data
    
    @property
    def geojson(self):
        """Load GeoJSON dengan caching"""
        if self._geojson is None:
            self._geojson = self._load_geojson()
        return self._geojson
    
    def _load_csv_data(self):
        """Load data dari CSV file"""
        try:
            df = pd.read_csv(self.config.CSV_FILE)
            # Ensure data types
            df['year'] = df['year'].astype(int)
            df['value_total'] = df['value_total'].astype(float)
            return df
        except Exception as e:
            raise ValueError(f"Error loading CSV data: {str(e)}")
    
    def _load_geojson(self):
        """Load GeoJSON file"""
        try:
            with open(self.config.GEOJSON_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise ValueError(f"Error loading GeoJSON: {str(e)}")
    
    def get_local_authorities(self):
        """Get list of unique local authorities"""
        return sorted(self.data['local_authority'].unique().tolist())
    
    def get_nations(self):
        """Get list of unique nations"""
        return sorted(self.data['nation'].unique().tolist())
    
    def get_years(self):
        """Get list of available years"""
        return sorted(self.data['year'].unique().tolist())
    
    def get_benefit_types(self):
        """Get list of benefit types"""
        return sorted(self.data['co_benefit_type'].unique().tolist())
    
    def get_data_for_map(self, year, benefit_type):
        """Get data formatted for map visualization"""
        filtered = self.data[
            (self.data['year'] == year) &
            (self.data['co_benefit_type'] == benefit_type)
        ]
        
        # Group by local_authority and sum values
        aggregated = filtered.groupby('local_authority')['value_total'].sum().reset_index()
        aggregated.columns = ['local_authority', 'value']
        
        return aggregated.to_dict('records')
    
    def get_data_for_chart(self, local_authority, benefit_types=None):
        """Get time series data for charts"""
        # Filter by local authority
        filtered = self.data[self.data['local_authority'] == local_authority]
        
        # Filter by benefit types if provided
        if benefit_types:
            filtered = filtered[filtered['co_benefit_type'].isin(benefit_types)]
        
        # Pivot data untuk format chart
        pivoted = filtered.pivot_table(
            index='year',
            columns='co_benefit_type',
            values='value_total',
            aggfunc='sum'
        ).reset_index()
        
        return pivoted.to_dict('records')
    
    def get_correlation_data(self, year=None):
        """Get correlation matrix between benefit types"""
        df = self.data.copy()
        
        if year:
            df = df[df['year'] == year]
        
        # Pivot untuk mendapatkan benefit types sebagai kolom
        pivot_df = df.pivot_table(
            index=['local_authority', 'year'],
            columns='co_benefit_type',
            values='value_total',
            aggfunc='sum'
        ).reset_index()
        
        # Calculate correlation
        benefit_cols = [col for col in pivot_df.columns if col not in ['local_authority', 'year']]
        corr_matrix = pivot_df[benefit_cols].corr()
        
        return corr_matrix.to_dict()
    
    def get_aggregated_data(self, group_by='nation'):
        """Get aggregated data by nation or other grouping"""
        if group_by == 'nation':
            aggregated = self.data.groupby(['nation', 'year', 'co_benefit_type'])['value_total'].sum().reset_index()
        else:
            aggregated = self.data.groupby(['local_authority', 'year', 'co_benefit_type'])['value_total'].sum().reset_index()
        
        return aggregated.to_dict('records')
    
    def get_summary_statistics(self):
        """Get summary statistics for all benefit types"""
        stats = {}
        
        for benefit_type in self.get_benefit_types():
            benefit_data = self.data[self.data['co_benefit_type'] == benefit_type]['value_total']
            stats[benefit_type] = {
                'mean': float(benefit_data.mean()),
                'median': float(benefit_data.median()),
                'std': float(benefit_data.std()),
                'min': float(benefit_data.min()),
                'max': float(benefit_data.max())
            }
        
        return stats
    
    def get_trend_data(self, local_authority):
        """Get trend data for a specific local authority"""
        filtered = self.data[self.data['local_authority'] == local_authority]
        
        # Group by year and benefit_type
        trend = filtered.groupby(['year', 'co_benefit_type'])['value_total'].sum().reset_index()
        
        return trend.to_dict('records')
    
    def get_heatmap_data(self, benefit_type, year_start=None, year_end=None):
        """Get data for heatmap visualization"""
        filtered = self.data[self.data['co_benefit_type'] == benefit_type].copy()
        
        if year_start:
            filtered = filtered[filtered['year'] >= year_start]
        if year_end:
            filtered = filtered[filtered['year'] <= year_end]
        
        # Pivot for heatmap (local_authorities x years)
        heatmap = filtered.pivot_table(
            index='local_authority',
            columns='year',
            values='value_total',
            aggfunc='sum'
        ).fillna(0)
        
        return {
            'index': heatmap.index.tolist(),
            'columns': heatmap.columns.tolist(),
            'data': heatmap.values.tolist()
        }
    
    def get_top_areas(self, benefit_type, year, n=10, ascending=False):
        """Get top N areas for a specific benefit type and year"""
        filtered = self.data[
            (self.data['co_benefit_type'] == benefit_type) &
            (self.data['year'] == year)
        ]
        
        sorted_data = filtered.sort_values('value_total', ascending=ascending).head(n)
        
        return sorted_data[['local_authority', 'value_total', 'nation']].to_dict('records')
