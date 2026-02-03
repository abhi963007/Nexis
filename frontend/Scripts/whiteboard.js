const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#ffffff';
const STROKE_WIDTH = 2; // Fixed stroke width instead of variable size
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;
let savedState;

// Set canvas size and initialize state
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reinitialize saved state after resize
    savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tool buttons functionality
const toolButtons = document.querySelectorAll('.tool-btn');
toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        toolButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentTool = button.getAttribute('data-tool');
    });
});

// Color picker functionality
const colorPicker = document.querySelector('.color-input');
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    document.querySelector('.color-btn').style.backgroundColor = currentColor;
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    [startX, startY] = [e.offsetX, e.offsetY];
    
    // Save the current canvas state when starting to draw
    if (currentTool !== 'pen') {
        savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = 'round';
    
    switch(currentTool) {
        case 'pen':
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
            break;
            
        case 'line':
            ctx.putImageData(savedState, 0, 0);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            break;
            
        case 'rectangle':
            ctx.putImageData(savedState, 0, 0);
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            ctx.beginPath();
            ctx.strokeRect(startX, startY, width, height);
            break;
            
        case 'circle':
            ctx.putImageData(savedState, 0, 0);
            const radius = Math.sqrt(
                Math.pow(e.offsetX - startX, 2) + 
                Math.pow(e.offsetY - startY, 2)
            );
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Save the final state after drawing is complete
    savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

document.querySelector('[data-tool="clear"]').addEventListener('click', clearCanvas);

// Save functionality
function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
}

document.querySelector('[data-tool="save"]').addEventListener('click', saveCanvas);

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Copy room ID functionality
document.querySelector('.copy-btn').addEventListener('click', () => {
    const roomId = document.querySelector('.room-id').textContent.split(':')[1].trim();
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
}); 