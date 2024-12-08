// GitHub에서 raw CSV 파일을 불러오는 URL
const csvFileUrl = 'https://raw.githubusercontent.com/hgy2124/WebApp_FinalProject/main/2020pollutant.csv';

// CSV 데이터를 저장할 변수
let csvData = [];

// 페이지가 로드될 때 데이터 로드 및 분석 함수 호출
window.onload = function() {
    loadAndAnalyzeData(csvFileUrl);
};

// CSV 데이터를 로드하고 분석하는 함수
function loadAndAnalyzeData(fileUrl) {
    fetch(fileUrl)
        .then(response => response.text()) // 파일을 텍스트 형식으로 읽음
        .then(data => {
            Papa.parse(data, {
                header: true, // 첫 번째 행을 헤더로 설정
                dynamicTyping: true, // 숫자는 자동으로 숫자로 변환
                complete: function (results) {
                    csvData = results.data; // 파싱된 데이터를 csvData에 저장
                    processAndVisualizeData(); // 데이터를 처리하고 시각화
                },
                error: function (error) {
                    console.error("CSV 파일 읽기 오류:", error);
                }
            });
        })
        .catch(error => console.error("CSV 파일 가져오기 오류:", error)); // fetch 오류 처리
}

// 데이터를 처리하고 시각화하는 함수
function processAndVisualizeData() {
    const regions = csvData.map(row => `${row["시도"]} ${row["시군구"]}`);
    const CO = csvData.map(row => parseFloat(row["CO"].replace(/,/g, "")) || 0); 
    const NOx = csvData.map(row => parseFloat(row["NOx"].replace(/,/g, "")) || 0); 
    const PM25 = csvData.map(row => parseFloat(row["PM-2.5"].replace(/,/g, "")) || 0); 

    drawBarChart(regions, CO, NOx, PM25);
    drawScatterChart(CO, PM25);
    drawPieChart(["CO", "NOx", "PM-2.5"], [sumArray(CO), sumArray(NOx), sumArray(PM25)]);
}

// 바 차트 그리기
function drawBarChart(regions, CO, NOx, PM25) {
    const ctx = document.getElementById("barChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: regions,
            datasets: [
                {
                    label: "CO Emission (kg/yr)",
                    data: CO,
                    backgroundColor: "rgba(255, 99, 132, 0.5)"
                },
                {
                    label: "NOx Emission (kg/yr)",
                    data: NOx,
                    backgroundColor: "rgba(54, 162, 235, 0.5)"
                },
                {
                    label: "PM-2.5 Emission (kg/yr)",
                    data: PM25,
                    backgroundColor: "rgba(75, 192, 192, 0.5)"
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Emission by Region"
                }
            },
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Region"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Emission (kg/yr)"
                    }
                }
            }
        }
    });
}

// 산점도 차트를 그리는 함수
function drawScatterChart(CO, PM25) {
    const ctx = document.getElementById("scatterChart").getContext("2d");
    const scatterData = CO.map((value, index) => ({ x: value, y: PM25[index] }));

    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "CO vs PM-2.5",
                    data: scatterData,
                    backgroundColor: "rgba(255, 159, 64, 0.5)"
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "CO and PM-2.5 Correlation"
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "CO Emission (kg/yr)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "PM-2.5 Emission (kg/yr)"
                    }
                }
            }
        }
    });
}

// 파이 차트를 그리는 함수
function drawPieChart(labels, data) {
    const ctx = document.getElementById("pieChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Emission Distribution",
                    data: data,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.5)",
                        "rgba(54, 162, 235, 0.5)",
                        "rgba(75, 192, 192, 0.5)"
                    ]
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Pollutant Emission Distribution"
                }
            }
        }
    });
}

// 배열의 값을 모두 더하는 유틸리티 함수
function sumArray(array) {
    return array.reduce((a, b) => a + b, 0);
}
