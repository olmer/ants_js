var Grid = function (height, width) {
    var cellSize = 5;
    var bw = width * cellSize || 400;
    var bh = height * cellSize || 400;

    this.gridHeight = height;
    this.gridWidth = width;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    this.drawBoard = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var x = 0; x <= bw; x += cellSize) {
            context.moveTo(0.5 + x + cellSize, cellSize);
            context.lineTo(0.5 + x + cellSize, bh + cellSize);
        }

        for (x = 0; x <= bh; x += cellSize) {
            context.moveTo(cellSize, 0.5 + x + cellSize);
            context.lineTo(bw + cellSize, 0.5 + x + cellSize);
        }

        context.strokeStyle = "#bbb";
        context.stroke();
    };

    this.drawCell = function (x, y, color) {
        x = parseInt(x, 10) || 0;
        y = parseInt(y, 10) || 0;
        if (x >= this.gridWidth || x < 0 || y >= this.gridHeight || y < 0) {
            throw new Error('Cell is out of boundaries');
        }
        color = color || '000';
        context.fillStyle = color;
        context.fillRect(x * cellSize + cellSize + 1, y * cellSize + cellSize + 1, cellSize - 1, cellSize - 1);
    };
};
