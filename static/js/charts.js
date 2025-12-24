/**
 * Charts Module - Visualization with Chart.js
 * Handles all chart visualizations
 */

let trendChart = null;
let comparisonChart = null;
let correlationChart = null;
let heatmapChart = null;
let topAreasChart = null;
let bottomAreasChart = null;

/**
 * Initialize all charts
 */
function initCharts() {
    setupChartEventListeners();
    loadInitialCorrelation();
    loadInitialHeatmap();
    loadTopAreas();
}

/**
 * Setup event listeners for chart controls
 */
function setupChartEventListeners() {
    // Local authority select
    const laSelect = document.getElementById('chart-la-select');
    if (laSelect) {
        laSelect.addEventListener('change', function() {
            if (this.value) {
                loadChartData(this.value);
            }
        });
    }
    
    // Benefit type checkboxes for charts
    document.querySelectorAll('.chart-benefit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const la = document.getElementById('chart-la-select').value;
            if (la) {
                loadChartData(la);
            }
        });
    });
    
    // Correlation update button
    const corrBtn = document.getElementById('update-correlation-btn');
    if (corrBtn) {
        corrBtn.addEventListener('click', loadInitialCorrelation);
    }
    
    // Heatmap update button
    const heatmapBtn = document.getElementById('update-heatmap-btn');
    if (heatmapBtn) {
        heatmapBtn.addEventListener('click', loadInitialHeatmap);
    }
}

/**
 * Load chart data for a specific local authority
 */
async function loadChartData(localAuthority) {
    try {
        showLoading();
        
        const selectedBenefits = Array.from(document.querySelectorAll('.chart-benefit-checkbox:checked'))
            .map(cb => cb.value);
        
        const params = new URLSearchParams({
            local_authority: localAuthority
        });
        
        selectedBenefits.forEach(bt => {
            params.append('benefit_types', bt);
        });
        
        const response = await fetch(`/api/chart-data?${params}`);
        const result = await response.json();
        
        if (result.success) {
            renderTrendChart(result.data, localAuthority);
            renderComparisonChart(result.data, localAuthority);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading chart data:', error);
        hideLoading();
        showError('Error loading chart data.');
    }
}

/**
 * Render trend line chart
 */
function renderTrendChart(data, localAuthority) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Destroy existing chart
    if (trendChart) {
        trendChart.destroy();
    }
    
    // Prepare data
    const years = data.map(d => d.year);
    const datasets = [];
    
    // Get benefit types from data
    const benefitTypes = Object.keys(data[0] || {}).filter(key => key !== 'year');
    
    benefitTypes.forEach(bt => {
        const btConfig = config.benefitConfigs[bt];
        if (btConfig) {
            datasets.push({
                label: btConfig.label,
                data: data.map(d => d[bt] || 0),
                borderColor: btConfig.color,
                backgroundColor: btConfig.color + '33',
                tension: 0.4,
                fill: false,
                pointRadius: 3,
                pointHoverRadius: 6
            });
        }
    });
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Tren Temporal - ${localAuthority}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tahun'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Nilai'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Render comparison bar chart
 */
function renderComparisonChart(data, localAuthority) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Destroy existing chart
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Get latest year data
    const latestData = data[data.length - 1] || {};
    const benefitTypes = Object.keys(latestData).filter(key => key !== 'year');
    
    const labels = [];
    const values = [];
    const colors = [];
    
    benefitTypes.forEach(bt => {
        const btConfig = config.benefitConfigs[bt];
        if (btConfig) {
            labels.push(btConfig.label);
            values.push(latestData[bt] || 0);
            colors.push(btConfig.color);
        }
    });
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Perbandingan Faktor (${latestData.year}) - ${localAuthority}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nilai'
                    }
                }
            }
        }
    });
}

/**
 * Load and render correlation matrix
 */
async function loadInitialCorrelation() {
    try {
        showLoading();
        
        const year = document.getElementById('correlation-year-select').value;
        const params = year ? `?year=${year}` : '';
        
        const response = await fetch(`/api/correlation${params}`);
        const result = await response.json();
        
        if (result.success) {
            renderCorrelationChart(result.data);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading correlation data:', error);
        hideLoading();
        showError('Error loading correlation data.');
    }
}

/**
 * Render correlation heatmap chart
 */
function renderCorrelationChart(correlationData) {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    
    // Destroy existing chart
    if (correlationChart) {
        correlationChart.destroy();
    }
    
    // Prepare data for heatmap
    const benefitTypes = Object.keys(correlationData);
    const labels = benefitTypes.map(bt => {
        const btConfig = config.benefitConfigs[bt];
        return btConfig ? btConfig.label : bt;
    });
    
    // Function to get color based on correlation value
    function getCorrelationColor(value) {
        // Red to Blue gradient for correlation
        // Strong positive (0.7-1.0): Dark Red
        // Moderate positive (0.3-0.7): Orange/Yellow
        // Weak (−0.3 to 0.3): Light Yellow/White
        // Moderate negative (−0.7 to −0.3): Light Blue
        // Strong negative (−1.0 to −0.7): Dark Blue
        
        if (value >= 0.7) return '#d32f2f';      // Dark Red
        if (value >= 0.3) return '#ff9800';      // Orange
        if (value >= -0.3) return '#ffeb3b';     // Yellow
        if (value >= -0.7) return '#42a5f5';     // Light Blue
        return '#1565c0';                         // Dark Blue
    }
    
    // Create matrix data
    const matrixData = benefitTypes.map((bt1, i) => {
        return benefitTypes.map((bt2, j) => {
            return correlationData[bt1][bt2] || 0;
        });
    });
    
    correlationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: labels.map((label, i) => {
                const rowData = matrixData[i];
                return {
                    label: label,
                    data: rowData,
                    backgroundColor: rowData.map(val => getCorrelationColor(val)),
                    borderColor: rowData.map(val => getCorrelationColor(val)),
                    borderWidth: 1
                };
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Matriks Korelasi Antar Faktor',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        generateLabels: function(chart) {
                            return chart.data.datasets.map((dataset, i) => ({
                                text: dataset.label,
                                fillStyle: config.benefitConfigs[benefitTypes[i]]?.color || '#ccc',
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            let interpretation = '';
                            if (value >= 0.7) interpretation = ' (Korelasi Kuat Positif)';
                            else if (value >= 0.3) interpretation = ' (Korelasi Sedang Positif)';
                            else if (value >= -0.3) interpretation = ' (Korelasi Lemah)';
                            else if (value >= -0.7) interpretation = ' (Korelasi Sedang Negatif)';
                            else interpretation = ' (Korelasi Kuat Negatif)';
                            
                            return context.dataset.label + ': ' + value.toFixed(3) + interpretation;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Faktor'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Koefisien Korelasi'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load and render heatmap
 */
async function loadInitialHeatmap() {
    try {
        showLoading();
        
        const benefitType = document.getElementById('heatmap-benefit-select').value;
        const yearStart = document.getElementById('heatmap-year-start').value;
        const yearEnd = document.getElementById('heatmap-year-end').value;
        
        const params = new URLSearchParams({
            benefit_type: benefitType,
            year_start: yearStart,
            year_end: yearEnd
        });
        
        const response = await fetch(`/api/heatmap-data?${params}`);
        const result = await response.json();
        
        if (result.success) {
            renderHeatmapChart(result.data, benefitType);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading heatmap data:', error);
        hideLoading();
        showError('Error loading heatmap data.');
    }
}

/**
 * Render heatmap chart
 */
function renderHeatmapChart(data, benefitType) {
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    
    // Destroy existing chart
    if (heatmapChart) {
        heatmapChart.destroy();
    }
    
    const btConfig = config.benefitConfigs[benefitType];
    
    // Take top 20 areas for better visualization
    const topAreas = data.index.slice(0, 20);
    const topData = data.data.slice(0, 20);
    
    heatmapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topAreas,
            datasets: data.columns.map((year, i) => {
                return {
                    label: year.toString(),
                    data: topData.map(row => row[i]),
                    backgroundColor: btConfig ? btConfig.color + '80' : '#4CAF50'
                };
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: `Heatmap: ${btConfig ? btConfig.label : benefitType} (Top 20 Area)`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Nilai'
                    }
                },
                y: {
                    stacked: false
                }
            }
        }
    });
}

/**
 * Load top and bottom areas
 */
async function loadTopAreas() {
    try {
        const benefitType = 'air_quality'; // Default
        const year = config.currentYear;
        
        // Top areas
        const topResponse = await fetch(`/api/top-areas?benefit_type=${benefitType}&year=${year}&n=10&order=desc`);
        const topResult = await topResponse.json();
        
        // Bottom areas
        const bottomResponse = await fetch(`/api/top-areas?benefit_type=${benefitType}&year=${year}&n=10&order=asc`);
        const bottomResult = await bottomResponse.json();
        
        if (topResult.success) {
            renderTopAreasChart(topResult.data);
        }
        
        if (bottomResult.success) {
            renderBottomAreasChart(bottomResult.data);
        }
    } catch (error) {
        console.error('Error loading top areas:', error);
    }
}

/**
 * Render top areas chart
 */
function renderTopAreasChart(data) {
    const ctx = document.getElementById('topAreasChart').getContext('2d');
    
    if (topAreasChart) {
        topAreasChart.destroy();
    }
    
    const labels = data.map(d => d.local_authority);
    const values = data.map(d => d.value_total);
    
    topAreasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai',
                data: values,
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Nilai: ' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Render bottom areas chart
 */
function renderBottomAreasChart(data) {
    const ctx = document.getElementById('bottomAreasChart').getContext('2d');
    
    if (bottomAreasChart) {
        bottomAreasChart.destroy();
    }
    
    const labels = data.map(d => d.local_authority);
    const values = data.map(d => d.value_total);
    
    bottomAreasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai',
                data: values,
                backgroundColor: '#F44336',
                borderColor: '#F44336',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Nilai: ' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
} else {
    initCharts();
}
