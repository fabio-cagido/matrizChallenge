const matrizElement = document.getElementById("matriz");
const svgElement = document.getElementById("linhaSvg");

const matrizData = [
    ['azul', 'azul', 'azul', 'azul', 'azul'],
    ['azul', 'laranja', 'laranja', 'laranja', 'azul'],
    ['azul', 'laranja', 'laranja', 'laranja', 'azul'],
    ['azul', 'laranja', 'laranja', 'laranja', 'azul'],
    ['azul', 'azul', 'azul', 'azul', 'azul']
];

let isDrawing = false;
let startX = 0;
let startY = 0;
let segments = 0;
let coveredLaranjas = new Set();

function createMatriz() {
    matrizData.forEach((row, rowIndex) => {
        row.forEach((color, colIndex) => {
            const bola = document.createElement("div");
            bola.classList.add("bola", color);
            bola.dataset.row = rowIndex;
            bola.dataset.col = colIndex;
            matrizElement.appendChild(bola);
        });
    });
}

function getCenterCoordinates(bola) {
    const rect = bola.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();
    return {
        cx: rect.left - svgRect.left + rect.width / 2,
        cy: rect.top - svgRect.top + rect.height / 2
    };
}

function startDraw(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
}

function endDraw(e) {
    if (!isDrawing) return;

    isDrawing = false;

    const endX = e.offsetX;
    const endY = e.offsetY;

    // Encontrar as bolas mais próximas do início e do fim
    const startBola = findNearestBola(startX, startY);
    const endBola = findNearestBola(endX, endY);

    // Desenhar uma linha reta entre os centros das bolas mais próximas
    if (startBola && endBola && startBola !== endBola) {
        const startCoords = getCenterCoordinates(startBola);
        const endCoords = getCenterCoordinates(endBola);

        drawLine(startCoords.cx, startCoords.cy, endCoords.cx, endCoords.cy);
        segments++;

        // Marcar as bolas laranjas cobertas pelo segmento
        markCoveredLaranjas(startBola, endBola);

        // Verifica e chama checkCompletion imediatamente após o quarto traço
        if (segments === 5) {
            checkCompletion();
        }
    }
}


// Função para marcar as bolas laranjas cobertas entre os pontos de início e fim
function markCoveredLaranjas(startBola, endBola) {
    // Adiciona a bola de início se for laranja
    if (startBola.classList.contains("laranja")) {
        coveredLaranjas.add(startBola);
    }
    // Adiciona a bola de fim se for laranja
    if (endBola.classList.contains("laranja")) {
        coveredLaranjas.add(endBola);
    }

    // Calcula o caminho entre as duas bolas e verifica as intermediárias
    const startRow = parseInt(startBola.dataset.row);
    const startCol = parseInt(startBola.dataset.col);
    const endRow = parseInt(endBola.dataset.row);
    const endCol = parseInt(endBola.dataset.col);

    // Detecta bolas intermediárias em linhas e colunas entre o início e o fim
    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);

    let currentRow = startRow + rowStep;
    let currentCol = startCol + colStep;

    while (currentRow !== endRow || currentCol !== endCol) {
        const intermediateBola = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
        if (intermediateBola && intermediateBola.classList.contains("laranja")) {
            coveredLaranjas.add(intermediateBola);
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
}


// Função para encontrar a bola mais próxima de um ponto (x, y)
function findNearestBola(x, y) {
    let nearestBola = null;
    let minDistance = Infinity;

    document.querySelectorAll(".bola").forEach(bola => {
        const { cx, cy } = getCenterCoordinates(bola);
        const distance = Math.hypot(cx - x, cy - y);

        if (distance < minDistance) {
            minDistance = distance;
            nearestBola = bola;
        }
    });

    return nearestBola;
}

// Função para desenhar uma linha reta entre dois pontos
function drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", 2);
    svgElement.appendChild(line);
}

// Função para verificar se todas as bolas laranjas foram cobertas
function checkCompletion() {
    const totalLaranjas = document.querySelectorAll(".bola.laranja").length;
    const laranjasCobertas = coveredLaranjas.size;

    if (laranjasCobertas === totalLaranjas) {
        alert(`Parabéns! Você cobriu todas as bolas laranjas em 4 segmentos. Total coberto: ${laranjasCobertas}`);
    } else {
        alert(`Tente novamente! Nem todas as bolas laranjas foram cobertas. Total coberto: ${laranjasCobertas} de ${totalLaranjas}`);
    }

    resetGame();
}

function resetGame() {
    svgElement.innerHTML = '';
    segments = 0;
    coveredLaranjas.clear();
}

svgElement.addEventListener("mousedown", startDraw);
svgElement.addEventListener("mouseup", endDraw);

createMatriz();
