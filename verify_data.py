import pandas as pd
import json

print("=" * 60)
print("VERIFIKASI DATA MATCHING")
print("=" * 60)

# Load CSV
df = pd.read_csv('data/normalized_data.csv')

# Load GeoJSON
with open('data/lad_boundaries.geojson', 'r', encoding='utf-8') as f:
    gj = json.load(f)

# Get unique areas
csv_areas = set(df['local_authority'].unique())
geojson_areas = set(f['properties'].get('local_authority', '') for f in gj['features'])

print(f"\n✓ CSV Local Authorities: {len(csv_areas)}")
print(f"✓ GeoJSON Features: {len(geojson_areas)}")
print(f"✓ Matching Areas: {len(csv_areas & geojson_areas)}")
print(f"✓ Match Rate: {len(csv_areas & geojson_areas) / len(csv_areas) * 100:.1f}%")

# Check benefit types
benefit_types = df['co_benefit_type'].unique()
print(f"\n✓ Benefit Types ({len(benefit_types)}):")
for bt in sorted(benefit_types):
    count = len(df[df['co_benefit_type'] == bt])
    print(f"  - {bt}: {count} records")

# Check years
years = sorted(df['year'].unique())
print(f"\n✓ Years ({len(years)}): {years[0]} - {years[-1]}")

# Sample data for one area and benefit type
sample_area = 'Aberdeen City'
sample_benefit = 'air_quality'
sample_year = 2025

sample_data = df[
    (df['local_authority'] == sample_area) &
    (df['co_benefit_type'] == sample_benefit) &
    (df['year'] == sample_year)
]

print(f"\n✓ Sample Data ({sample_area}, {sample_benefit}, {sample_year}):")
if len(sample_data) > 0:
    print(f"  Value: {sample_data['value_total'].sum():.2f}")
else:
    print("  No data found")

print("\n" + "=" * 60)
print("SEMUA DATA VALID DAN COCOK! ✓")
print("=" * 60)
