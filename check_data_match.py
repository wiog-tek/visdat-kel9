import pandas as pd
import json

# Load CSV
df = pd.read_csv('data/normalized_data.csv')
print('CSV Local Authorities (first 10):')
print(df['local_authority'].unique()[:10])

# Load GeoJSON
with open('data/lad_boundaries.geojson', 'r', encoding='utf-8') as f:
    gj = json.load(f)

print('\nGeoJSON Properties (first feature):')
print(list(gj['features'][0]['properties'].keys()))

print('\nSample area names from GeoJSON (first 10):')
for i in range(min(10, len(gj['features']))):
    print(f"  - {gj['features'][i]['properties'].get('lad23nm', 'NOT FOUND')}")

print('\nChecking if CSV names match GeoJSON names...')
csv_areas = set(df['local_authority'].unique())
geojson_areas = set(f['properties'].get('lad23nm', '') for f in gj['features'])

print(f'\nCSV has {len(csv_areas)} unique areas')
print(f'GeoJSON has {len(geojson_areas)} unique areas')
print(f'Matching areas: {len(csv_areas & geojson_areas)}')
print(f'Only in CSV: {len(csv_areas - geojson_areas)}')
print(f'Only in GeoJSON: {len(geojson_areas - csv_areas)}')

if len(csv_areas - geojson_areas) > 0:
    print('\nSample CSV areas not in GeoJSON:')
    print(list(csv_areas - geojson_areas)[:5])
