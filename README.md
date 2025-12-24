# Analisis Pengaruh Faktor Lingkungan terhadap Tingkat Keselamatan Jalan di Inggris
# Berdasarkan Data UK Co-Benefits Atlas

## Deskripsi Proyek

Dashboard interaktif untuk menganalisis hubungan antara lima faktor utama yang mempengaruhi tingkat keselamatan jalan di Inggris:

1. **Kemacetan (Congestion)** - Dampak terhadap tingkat kemacetan lalu lintas
2. **Kondisi Jalan (Road Repairs)** - Biaya perbaikan dan kondisi jalan
3. **Kualitas Udara (Air Quality)** - Manfaat dari peningkatan kualitas udara
4. **Aktivitas Fisik (Physical Activity)** - Manfaat dari peningkatan aktivitas fisik
5. **Kebisingan (Noise)** - Pengaruh tingkat kebisingan

## Fitur Utama

### 🗺️ Peta Choropleth Interaktif
- Visualisasi spasial data berdasarkan Local Authority di UK
- Kontrol tahun dan faktor yang ditampilkan
- Popup informasi detail saat klik area
- Legenda dengan skala warna

### 📊 Grafik Tren dan Analisis
- **Grafik Tren Temporal**: Menampilkan perubahan nilai faktor dari tahun ke tahun
- **Grafik Perbandingan**: Membandingkan nilai semua faktor dalam satu tahun
- **Matriks Korelasi**: Analisis hubungan antar faktor
- **Heatmap**: Distribusi spasial-temporal data

### 🎯 Analisis Area
- Ranking area dengan nilai tertinggi/terendah
- Filter berdasarkan faktor dan tahun
- Visualisasi perbandingan antar area

## Struktur Data

Data berasal dari file `normalized_data.csv` dengan kolom:
- `local_authority`: Nama area administratif
- `nation`: Negara bagian (Scotland, England, dll)
- `year`: Tahun data (2025-2050)
- `co_benefit_type`: Tipe faktor (congestion, road_repairs, air_quality, physical_activity, noise)
- `value_total`: Nilai ter-normalisasi

## Teknologi

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualisasi**: Chart.js, Leaflet.js
- **Data Processing**: Pandas, NumPy
- **Styling**: Bootstrap 5

## Instalasi dan Setup

### Persyaratan Sistem
- Python 3.8+
- pip
- Browser modern dengan JavaScript enabled

### Langkah Instalasi

1. **Clone atau download project**
   ```bash
   cd path/to/project
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Jalankan aplikasi**
   ```bash
   python app.py
   ```

4. **Akses dashboard**
   - Buka browser dan kunjungi `http://localhost:5000`

## Penggunaan

### Navigasi Dashboard
- Gunakan menu navigasi untuk berpindah antar section
- Scroll otomatis ke section yang dipilih

### Peta Interaktif
- Pilih tahun menggunakan dropdown
- Centang faktor yang ingin ditampilkan
- Klik area pada peta untuk melihat detail
- Hover untuk highlight area

### Analisis Grafik
- Pilih Local Authority dari dropdown
- Centang faktor untuk ditampilkan di grafik
- Klik "Lihat Detail" pada popup peta untuk otomatis memilih area

### Korelasi dan Heatmap
- Gunakan kontrol untuk memfilter data
- Klik "Update" untuk refresh visualisasi

## API Endpoints

- `GET /api/geojson` - GeoJSON data untuk peta
- `GET /api/map-data` - Data untuk visualisasi peta
- `GET /api/chart-data` - Data tren untuk grafik
- `GET /api/correlation` - Matriks korelasi
- `GET /api/heatmap-data` - Data untuk heatmap
- `GET /api/top-areas` - Ranking area
- `GET /api/summary-stats` - Statistik ringkasan

## File Struktur

```
tubes-saya/
├── app.py                 # Entry point aplikasi
├── config.py             # Konfigurasi aplikasi
├── requirements.txt      # Dependencies Python
├── data/
│   ├── lad_boundaries.geojson    # Data geografis UK
│   └── normalized_data.csv       # Data utama
├── models/
│   ├── __init__.py
│   └── data_loader.py            # Data loading dan processing
├── controllers/
│   ├── __init__.py
│   ├── main_controller.py        # Main routes
│   └── api_controller.py         # API endpoints
├── static/
│   ├── css/
│   │   └── style.css            # Custom styling
│   └── js/
│       ├── main.js              # Utility functions
│       ├── map.js               # Map visualization
│       └── charts.js            # Chart visualizations
└── templates/
    ├── base.html                # Base template
    └── index.html               # Main dashboard
```

## Kontribusi

Project ini dibuat sebagai tugas akhir untuk mata kuliah Visualisasi Data.

## Lisensi

Data berasal dari UK Co-Benefits Atlas. Kode aplikasi bersifat open source untuk keperluan edukasi.

## Kontak

Untuk pertanyaan atau feedback, silakan hubungi tim pengembang.
