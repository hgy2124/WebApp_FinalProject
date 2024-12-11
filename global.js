// API 키 
const API_KEY = "66e9ef6d8d3f9379426a1f164ea1014b"; 

// 변수 초기화
let tempHumidityChart, pollutantBarChart, pollutantDonutChart;
let timeLabels = [];
let tempData = [];
let humidityData = [];
let barChartData = [0, 0, 0, 0, 0, 0, 0]; 
let donutChartData = [0, 0, 0, 0, 0, 0, 0];
let cachedLocation = null;


// 사이드바 이동
function navigateTo(page) {
    window.location.href = page; 
}


function calculateDiscomfortIndex(temp, humidity) {
    // 불쾌지수 공식
    return (0.81 * temp) + (0.01 * humidity * (0.99 * temp - 14.3)) + 46.3;
}

// 초기화 함수
function initializeApp() {
    // index.html에서만 위치 요청 실행
    if (window.location.pathname.includes("index.html")) {
        requestLocation();
        setInterval(requestLocation, 60000); // 1분마다 업데이트
    } else {
        console.log("Location request skipped: not on index.html");
    }

    // 차트 초기화
    initializeCharts();
}
initializeApp();

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

// 색상 설정 함수
function updateColors() {
    const tempValue = document.getElementById('temp-value');
    const humidityValue = document.getElementById('humidity-value');
    const discomfortIndex = document.getElementById('discomfort-index');

    // 수치 값 가져오기
    const temp = parseFloat(tempValue.innerText);
    const humidity = parseFloat(humidityValue.innerText);
    const discomfort = parseFloat(discomfortIndex.innerText);

    // 온도 색상
    tempValue.style.color = temp > 30 ? 'red' : temp > 20 ? 'orange' : 'blue';

    // 습도 색상
    humidityValue.style.color = humidity > 70 ? 'blue' : humidity > 40 ? 'green' : 'gray';

    // 불쾌지수 색상
    discomfortIndex.style.color = discomfort > 75 ? 'red' : discomfort > 60 ? 'orange' : 'green';
}


// 국가 코드에 맞는 국기 이미지를 업데이트하는 함수
function updateFlag(countryCode) {
    const flagImg = document.getElementById("country-flag");
    flagImg.src = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
}


// 오염 물질 데이터를 차트에 반영하는 함수
function updateCharts(weatherData, pollutants) {
    // 막대 차트 데이터 갱신
    barChartData = [
        pollutants[0], // PM2.5
        pollutants[1], // PM10
        pollutants[2], // NO2
        pollutants[3], // NH3
        pollutants[4], // CO
        pollutants[5], // SO2
        pollutants[6]  // O3
    ];

    // 막대 차트 레이블
    pollutantBarChart.data.labels = [
        'PM2.5', 'PM10', 'NO2', 'NH3', 'CO', 'SO2', 'O3'
    ];
    
    // 막대 차트 색상 설정
    pollutantBarChart.data.datasets[0].backgroundColor = [
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 
        'rgba(255, 99, 132, 0.2)'
    ];
    pollutantBarChart.data.datasets[0].data = barChartData;
    pollutantBarChart.update();

    // 도넛 차트 데이터 갱신
    donutChartData = pollutants;
    pollutantDonutChart.data.labels = [
        'PM2.5', 'PM10', 'NO2', 'NH3', 'CO', 'SO2', 'O3'
    ];
    pollutantDonutChart.data.datasets[0].data = donutChartData;

    // 도넛 차트 색상 설정
    pollutantDonutChart.data.datasets[0].backgroundColor = [
        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)'
    ];

    pollutantDonutChart.update();
}



// 날씨 디스플레이 업데이트 함수
function updateWeatherDisplay(weatherData, cityName) {
    const temp = weatherData.temp;
    const humidity = weatherData.humidity;

    // 도시 이름 업데이트
    document.getElementById("city-name").innerText = cityName || "Unknown";

    // 불쾌지수 계산
    const discomfortIndex = calculateDiscomfortIndex(temp, humidity);
    let discomfortLevelImg = "";

    if (discomfortIndex <= 70) {
        discomfortLevelImg = "smile_1.png"; // 적당한 쾌적
    } else if (discomfortIndex <= 80) {
        discomfortLevelImg = "smile_2.png"; // 약간 불쾌
    } else {
        discomfortLevelImg = "smile_3.png"; // 매우 불쾌
    }

    // 정보 업데이트
    document.getElementById("temp-value").innerText = temp.toFixed(1);
    document.getElementById("humidity-value").innerText = humidity.toFixed(1);
    document.getElementById("discomfort-index").innerText = discomfortIndex.toFixed(1);
    document.getElementById("discomfort-img").src = discomfortLevelImg;

    // 색상 업데이트 호출
    updateColors();
}

// 글로벌 데이터 가져오기
function fetchGlobalData() {
    const selectElement = document.getElementById("country-select");
    const selectedCity = selectElement.value;
    const countryCode = selectElement.selectedOptions[0].getAttribute("data-country");
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const temp = parseFloat(data.main.temp);
            const humidity = parseFloat(data.main.humidity);

            // 오염 물질 데이터를 요청합니다
            const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`;
            fetch(airQualityUrl)
                .then(response => response.json())
                .then(airData => {
                    const components = airData.list[0].components;
                    const pollutants = [
                        components.pm2_5 || 0,
                        components.pm10 || 0,
                        components.no2 || 0,
                        components.nh3 || 0,
                        components.co || 0,
                        components.so2 || 0,
                        components.o3 || 0
                    ];

                    // 차트 갱신
                    updateWeatherDisplay({ temp, humidity }, selectedCity);
                    updateCharts({ temp, humidity }, pollutants);
                    updateFlag(countryCode);  
                })
                .catch(err => {
                    console.error("Air quality data fetch error:", err);
                });
        })
        .catch(err => {
            console.error("Weather data fetch error:", err);
        });
}



