var Grid = function (height, width) {
    var cellSize = 15;
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

    this.drawPath = function (x1, y1, x2, y2) {
        x1=0;x2=0;y1=0;y2=5;
        if (x1 >= this.gridWidth || x1 < 0 || y1 >= this.gridHeight || y1 < 0) {
            throw new Error('Cell is out of boundaries');
        }
        if (x2 >= this.gridWidth || x2 < 0 || y2 >= this.gridHeight || y2 < 0) {
            throw new Error('Cell is out of boundaries');
        }

        context.beginPath();

        context.moveTo(cellSize * x1 + cellSize * 1.5, cellSize * y1 + cellSize * 1.5);
        context.lineTo(cellSize * x2 + cellSize * 1.5, cellSize * y2 + cellSize * 1.5);

        context.strokeStyle = "red";
        context.stroke();
    }
};
