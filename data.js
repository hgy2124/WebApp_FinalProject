// 사이드바 이동
function navigateTo(page) {
    window.location.href = page; 
}

// CSV 파일 URL 설정 
const csvFileUrl = '2020pollutant.csv'; // CSV 파일 경로

// CSV 데이터를 저장할 변수
let csvData = [];

// 페이지가 로드될 때 데이터 로드 및 분석 함수 호출
window.onload = function() {
    loadAndAnalyzeData(csvFileUrl);
};

// CSV 데이터를 로드하고 분석하는 함수
function loadAndAnalyzeData(fileUrl) {
    // CSV 파일을 가져오는 fetch 요청
    fetch(fileUrl)
        .then(response => response.text()) // 파일을 텍스트 형식으로 읽음
        .then(data => {
            console.log("CSV 데이터 로드 완료:", data); // 데이터가 제대로 로드됐는지 확인
            // PapaParse를 이용해 CSV 데이터를 읽음
            Papa.parse(data, {
                header: true, // 첫 번째 행을 헤더로 설정
                dynamicTyping: true, // 숫자는 자동으로 숫자로 변환
                complete: function (results) {
                    console.log("CSV 파싱 완료:", results); // 파싱된 결과 확인
                    csvData = results.data; // 파싱된 데이터를 csvData에 저장
                    processAndVisualizeData(); // 데이터를 처리하고 시각화
                },
                error: function (error) {
                    console.error("CSV 파일 읽기 오류:", error); // 오류가 발생하면 콘솔에 출력
                }
            });
        })
        .catch(error => console.error("CSV 파일 가져오기 오류:", error)); // fetch 오류 처리
}

// 데이터를 처리하고 시각화하는 함수
function processAndVisualizeData() {
    console.log("csvData:", csvData); // csvData가 제대로 파싱되었는지 확인

    // CSV에서 필요한 데이터를 추출
    const regions = csvData.map(row => `${row["시도"]} ${row["시군구"]}`);
    const CO = csvData.map(row => parseFloat(row["CO"].replace(/,/g, "")) || 0); // CO 배출량
    const NOx = csvData.map(row => parseFloat(row["NOx"].replace(/,/g, "")) || 0); // NOx 배출량
    const PM25 = csvData.map(row => parseFloat(row["PM-2.5"].replace(/,/g, "")) || 0); // PM-2.5 배출량

    // 데이터가 제대로 파싱되었는지 확인
    console.log("Regions:", regions);
    console.log("CO:", CO);
    console.log("NOx:", NOx);
    console.log("PM25:", PM25);

    // 바 차트 그리기
    drawBarChart(regions, CO, NOx, PM25);
    // 산점도 차트 그리기
    drawScatterChart(CO, PM25);
    // 파이 차트 그리기
    drawPieChart(["CO", "NOx", "PM-2.5"], [sumArray(CO), sumArray(NOx), sumArray(PM25)]);
}


// 바 차트를 그리는 함수
function drawBarChart(regions, CO, NOx, PM25) {
    const ctx = document.getElementById("barChart").getContext("2d");
    new Chart(ctx, {
        type: "bar", // 차트 유형은 바 차트
        data: {
            labels: regions, // x축 레이블 (지역 이름)
            datasets: [
                {
                    label: "CO Emission (kg/yr)", // CO 배출량
                    data: CO, // CO 데이터
                    backgroundColor: "rgba(255, 99, 132, 0.5)" // 색상
                },
                {
                    label: "NOx Emission (kg/yr)", // NOx 배출량
                    data: NOx, // NOx 데이터
                    backgroundColor: "rgba(54, 162, 235, 0.5)" // 색상
                },
                {
                    label: "PM-2.5 Emission (kg/yr)", // PM-2.5 배출량
                    data: PM25, // PM-2.5 데이터
                    backgroundColor: "rgba(75, 192, 192, 0.5)" // 색상
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true, // 제목 표시
                    text: "Emission by Region" // 제목 텍스트
                }
            },
            responsive: true, // 반응형
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Region" // x축 제목
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Emission (kg/yr)" // y축 제목
                    }
                }
            }
        }
    });
}

// 산점도 차트를 그리는 함수
function drawScatterChart(CO, PM25) {
    const ctx = document.getElementById("scatterChart").getContext("2d");
    const scatterData = CO.map((value, index) => ({ x: value, y: PM25[index] })); // CO와 PM-2.5 데이터 쌍으로 만듦

    new Chart(ctx, {
        type: "scatter", // 차트 유형은 산점도
        data: {
            datasets: [
                {
                    label: "CO vs PM-2.5", // CO와 PM-2.5의 관계
                    data: scatterData, // 산점도 데이터
                    backgroundColor: "rgba(255, 159, 64, 0.5)" // 색상
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true, // 제목 표시
                    text: "CO and PM-2.5 Correlation" // 제목 텍스트
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "CO Emission (kg/yr)" // x축 제목
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "PM-2.5 Emission (kg/yr)" // y축 제목
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
        type: "pie", // 차트 유형은 파이 차트
        data: {
            labels: labels, // 레이블 (배출물질 이름)
            datasets: [
                {
                    label: "Total Emission Distribution", // 총 배출량 분포
                    data: data, // 데이터 (CO, NOx, PM-2.5)
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.5)", // 색상
                        "rgba(54, 162, 235, 0.5)", // 색상
                        "rgba(75, 192, 192, 0.5)"  // 색상
                    ]
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true, // 제목 표시
                    text: "Pollutant Emission Distribution" // 제목 텍스트
                }
            }
        }
    });
}

// 배열의 값을 모두 더하는 유틸리티 함수
function sumArray(array) {
    return array.reduce((a, b) => a + b, 0); // 배열의 모든 값을 더함
}
