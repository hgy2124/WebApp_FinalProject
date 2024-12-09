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

function processAndVisualizeData() {
    if (!jsonData || jsonData.length === 0) {
        console.error("No data found!");
        return;
    }

    const regions = jsonData.map(row => `${row["시도"]} ${row["시군구"]}`);
    
    const CO = cleanData("CO");
    const NOx = cleanData("NOx");
    const PM25 = cleanData("PM-2.5");

    const validCO = CO.filter(value => !isNaN(value) && value > 0);
    const validNOx = NOx.filter(value => !isNaN(value) && value > 0);
    const validPM25 = PM25.filter(value => !isNaN(value) && value > 0);

    if (validCO.length === 0 || validNOx.length === 0 || validPM25.length === 0) {
        console.error("유효한 데이터가 없습니다.");
        return;
    }

    drawBarChart(regions, validCO, validNOx, validPM25);
    drawScatterChart(validCO, validPM25);
    drawPieChart(["CO", "NOx", "PM-2.5"], [sumArray(validCO), sumArray(validNOx), sumArray(validPM25)]);
}

function sumArray(arr) {
    return arr.reduce((acc, value) => acc + value, 0);
}

function drawBarChart(regions, CO, NOx, PM25) {
    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: regions,
            datasets: [{
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
        }
    });
}

function drawScatterChart(CO, PM25) {
    new Chart(document.getElementById('scatterChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'CO vs PM2.5',
                data: CO.map((coValue, index) => ({ x: coValue, y: PM25[index] })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        }
    });
}

function drawPieChart(labels, data) {
    new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)']
            }]
        }
    });
}