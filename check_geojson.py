import json

# Load GeoJSON
with open('data/lad_boundaries.geojson', 'r', encoding='utf-8') as f:
    gj = json.load(f)

print('Total features:', len(gj['features']))
print('\nFirst feature properties:')
for key, value in gj['features'][0]['properties'].items():
    print(f"  {key}: {value}")

print('\nSample local_authority names from GeoJSON (first 20):')
for i in range(min(20, len(gj['features']))):
    la = gj['features'][i]['properties'].get('local_authority', 'NOT FOUND')
    print(f"  {i+1}. {la}")
