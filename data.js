// JSON 파일 경로
const jsonFileUrl = '2020pollutant.json'; // 파일 위치에 맞게 경로 설정

// JSON 데이터를 저장할 변수
let jsonData = [];

// 페이지가 로드될 때 데이터 로드 및 분석 함수 호출
window.onload = function() {
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
                        label: function(tooltipItem) {
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

// Pie Chart: 오염 물질 비율 비교
function drawPieChartByRegion() {
    const regions = Object.keys(aggregateByRegion("CO"));
    const pollutants = ["CO", "NOx", "PM-2.5"];
    const regionSums = pollutants.map(pollutant => {
        const dataByRegion = aggregateByRegion(pollutant);
        return Object.values(dataByRegion).reduce((acc, value) => acc + value, 0);
    });

    new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: pollutants,
            datasets: [{
                data: regionSums,
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const pollutant = pollutants[tooltipItem.dataIndex];
                            const total = regionSums[tooltipItem.dataIndex];
                            return `${pollutant}: ${total.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}
