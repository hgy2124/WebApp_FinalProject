// API 키 
const API_KEY = "66e9ef6d8d3f9379426a1f164ea1014b"; 

// 변수 초기화
let tempHumidityChart, pollutantBarChart, pollutantDonutChart;
let timeLabels = [];
let tempData = [];
let humidityData = [];
let barChartData = [0, 0, 0, 0, 0, 0, 0]; 
let donutChartData = [0, 0, 0, 0, 0, 0, 0];

// 차트 초기화 함수
function initializeCharts() {
    // 라인 차트
    tempHumidityChart = new Chart(document.getElementById('tempHumidityChart'), {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // 막대 차트
    pollutantBarChart = new Chart(document.getElementById('pollutantBarChart'), {
        type: 'bar',
        data: {
            labels: ['PM2.5', 'PM10', 'NOx', 'NH3', 'CO2', 'SO2', 'O3'],
            datasets: [
                {
                    label: 'Pollutant Levels',
                    data: barChartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)'
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // 도넛 차트
    pollutantDonutChart = new Chart(document.getElementById('pollutantDonutChart'), {
        type: 'doughnut',
        data: {
            labels: ['PM2.5', 'PM10', 'NOx', 'NH3', 'CO2', 'SO2', 'O3'],
            datasets: [
                {
                    data: donutChartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)'
                    ]
                }
            ]
        },
        options: {
            responsive: true
        }
    });
}

// 차트 업데이트 함수
function updateCharts(weatherData, pollutantData) {
    // 온도, 습도 업데이트
    const currentTime = new Date().toLocaleTimeString();
    timeLabels.push(currentTime);
    tempData.push(weatherData.temp);
    humidityData.push(weatherData.humidity);
    tempHumidityChart.update();

    // 막대 차트 데이터 업데이트
    barChartData = [
        pollutantData.pm25,
        pollutantData.pm10,
        pollutantData.nox,
        pollutantData.nh3,
        pollutantData.co2,
        pollutantData.so2,
        pollutantData.voc
    ];
    pollutantBarChart.data.datasets[0].data = barChartData;
    pollutantBarChart.update();

    // 도넛 차트 데이터 업데이트
    donutChartData = [...barChartData];
    pollutantDonutChart.data.datasets[0].data = donutChartData;
    pollutantDonutChart.update();
}

// 위치와 날씨 데이터 처리
function onGeoOk(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`;
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const weatherData = {
                temp: data.main.temp,
                humidity: data.main.humidity
            };
            document.querySelector("#city-name").innerText = data.name;
            document.querySelector("#temp").innerText = weatherData.temp;
            document.querySelector("#humidity").innerText = weatherData.humidity;

            const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`;
            return fetch(airQualityUrl)
                .then(response => response.json())
                .then(airData => {
                    const components = airData.list[0].components;
                    const pollutantData = {
                        pm25: components.pm2_5,
                        pm10: components.pm10,
                        nox: components.no2,
                        nh3: components.nh3,
                        co2: components.co,
                        so2: components.so2,
                        o3: components.o3 
                    };

                    updateCharts(weatherData, pollutantData);
                });
        })
        .catch(err => console.error(err));
}

// 위치 요청 및 차트 초기화
navigator.geolocation.getCurrentPosition(onGeoOk, () => alert("Can't access your location."));
initializeCharts();

// 10분마다 데이터 갱신
setInterval(() => {
    navigator.geolocation.getCurrentPosition(onGeoOk, () => alert("Can't access your location."));
}, 600000);//밀리초
