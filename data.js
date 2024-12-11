// JSON 파일 경로
const jsonFileUrl = '2020pollutant.json'; // 파일 위치에 맞게 경로 설정

// JSON 데이터를 저장할 변수
let jsonData = [];


// 사이드바 이동
function navigateTo(page) {
    window.location.href = page; 
}


// 페이지가 로드될 때 데이터 로드 및 분석 함수 호출
window.onload = function () {
    loadAndAnalyzeData(jsonFileUrl);
};

function loadAndAnalyzeData(jsonFileUrl) {
    fetch(jsonFileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            jsonData = data;
            processAndVisualizeData();
        })
        .catch(error => console.error("JSON 파일 가져오기 오류:", error));
}

function cleanData(field) {
    return jsonData.map(row => parseFloat(row[field]?.toString().replace(/,/g, "").trim()) || 0);
}

function aggregateByRegion(field) {
    const regionMap = {};

    jsonData.forEach(row => {
        const region = row["시도"];
        const value = parseFloat(row[field]?.toString().replace(/,/g, "").trim()) || 0;

        if (!regionMap[region]) {
            regionMap[region] = 0;
        }
        regionMap[region] += value; // 해당 시도의 값 누적
    });

    return regionMap;
}

function processAndVisualizeData() {
    if (!jsonData || jsonData.length === 0) {
        console.error("No data found!");
        return;
    }

    // 시도별 데이터 집계
    const coByRegion = aggregateByRegion("CO");
    const noxByRegion = aggregateByRegion("NOx");
    const pm25ByRegion = aggregateByRegion("PM-2.5");

    // 시각화를 위한 데이터 준비
    const regions = Object.keys(coByRegion);
    const CO = regions.map(region => coByRegion[region]);
    const NOx = regions.map(region => noxByRegion[region]);
    const PM25 = regions.map(region => pm25ByRegion[region]);

    drawBarChart(regions, CO, NOx, PM25);
    drawTBarChart(["CO", "NOx", "SOx", "TSP", "PM-10", "PM-2.5", "VOC", "NH3", "BC"], jsonData);
    drawScatterChartByRegion();
    drawPieChartByRegionExpanded();
    drawPieChart(jsonData);
}

//Total_barchart 

function drawTBarChart(emissions, jsonData) {
    const totals = emissions.map(emission =>
        jsonData.reduce((sum, record) => sum + record[emission], 0)
    );

    const ctx = document.getElementById('Total_barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: emissions,
            datasets: [{
                label: 'Total Emissions',
                data: totals,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// Total Pie Chart: 오염 물질 비율 비교
function drawPieChartByRegionExpanded() {
    // JSON 데이터의 모든 필드 가져오기
    const excludeFields = ["시도", "시군구", "배출원대분류", "배출원중분류", "배출원소분류", "연료대분류", "연료소분류"];
    const allFields = Object.keys(jsonData[0]).filter(field => !excludeFields.includes(field));

    // 각 필드에 대해 시도별 합산
    const fieldSums = allFields.map(field => {
        const dataByRegion = aggregateByRegion(field);
        return Object.values(dataByRegion).reduce((acc, value) => acc + value, 0);
    });

    new Chart(document.getElementById('Total_pieChart'), {
        type: 'pie',
        data: {
            labels: allFields,
            datasets: [{
                data: fieldSums,
                backgroundColor: allFields.map(() =>
                    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                )
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const field = allFields[tooltipItem.dataIndex];
                            const total = fieldSums[tooltipItem.dataIndex];
                            return `${field}: ${total.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}


function drawBarChart(regions, CO, NOx, PM25) {
    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: regions,
            datasets: [
                {
                    label: 'CO',
                    data: CO,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                },
                {
                    label: 'NOx',
                    data: NOx,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                    label: 'PM2.5',
                    data: PM25,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Region (시도)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pollutant Levels'
                    }
                }
            }
        }
    });
}

// piechart - Fuel Type Emissions Distribution
function drawPieChart(jsonData) {
    const emissions = ["CO", "NOx", "PM-2.5"]; // 예시: 배출량에 사용되는 필드명

    // Fuel Types 추출
    const fuelTypes = Array.from(new Set(jsonData.map(record => record.연료대분류)));

    // Fuel별 배출량 계산
    const fuelEmissions = fuelTypes.map(fuel => {
        return emissions.reduce((total, emission) => {
            return total + jsonData.filter(record => record.연료대분류 === fuel)
                .reduce((sum, record) => sum + record[emission], 0);
        }, 0);
    });

    const ctx2 = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: fuelTypes,
            datasets: [{
                label: 'Fuel Emissions',
                data: fuelEmissions,
                backgroundColor: fuelTypes.map(() =>
                    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                ),
                borderColor: fuelTypes.map(() => '#fff'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Scatter Chart: CO vs PM2.5 - 시도별 평균 사용
function drawScatterChartByRegion() {
    const regionMapCO = aggregateByRegion("CO");
    const regionMapPM25 = aggregateByRegion("PM-2.5");

    const regions = Object.keys(regionMapCO);
    const scatterData = regions.map(region => ({
        x: regionMapCO[region],
        y: regionMapPM25[region],
        label: region
    }));

    new Chart(document.getElementById('scatterChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'CO vs PM2.5 (시도별)',
                data: scatterData.map(d => ({ x: d.x, y: d.y })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                pointLabels: scatterData.map(d => d.label)
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const region = scatterData[tooltipItem.dataIndex].label;
                            return `Region: ${region}, CO: ${tooltipItem.raw.x}, PM2.5: ${tooltipItem.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'CO Levels'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'PM2.5 Levels'
                    }
                }
            }
        }
    });
}
