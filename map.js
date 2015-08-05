var Grid = function(height, width) {
    var cellSize = 5;
    var bw = width * cellSize || 400;
    var bh = height * cellSize || 400;

    this.gridHeight = height;
    this.gridWidth = width;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    this.drawBoard = function() {
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

    this.drawCell = function(x, y, color) {
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

var Map = function() {
    //numberOfPlayers = numberOfPlayers || 0;

    var ids = {
            nothing: 0,
            ant: 1,
            water: 2,
            food: 3,
            hive: 4
        },
        entity = {
            [ids.nothing]: {color: '#FFF'},
            [ids.ant]: {color: '#00FF9A'},
            [ids.water]: {color: '#0AF'},
            [ids.food]: {color: '#FFF900'},
            [ids.hive]: {color: '#714F54'}
        },
        mapData = [],
        generationInput = {
            probabilityOfWater: 0.27,
            emptyCellCount: 5,
            fullCellCount: 4,
            smoothenIterations: 5,
            fillEmptySpaceIterationLimit: 2
        },
        mapHeight = 100,
        mapWidth = 200
    ;

    var getCell = function(x, y) {
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        return mapData[y][x];
    };
    var setCell = function(entityId, x, y) {
        entityId = parseInt(entityId, 10);
        if(typeof entity[entityId] === 'undefined') {
            throw new Error('Invalid entity type: ' + entityId);
        }
        if(x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        mapData[y][x] = entityId;
    };

    var grid = new Grid(mapHeight, mapWidth);
    var fillMapData = function() {
        for(var y = 0; y < mapHeight; y++) {
            mapData[y] = [];
            for(var x = 0; x < mapWidth; x++) {
                setCell(ids.nothing, x, y);
            }
        }
    };
    var generateWater = function() {
        var cellSurroundX, cellSurroundY;

        if(localStorage.getItem('cachedMap')) {
            mapData = JSON.parse(localStorage.getItem('cachedMap'));
            return;
        }

        for(var y = 0; y < mapHeight; y++) {
            for(var x = 0; x < mapWidth; x++) {
                if (Math.random() < generationInput.probabilityOfWater) {
                    setCell(ids.water, x, y);
                }
            }
        }
        //number of smoothen iteration
        for(var iteration = 0; iteration < generationInput.smoothenIterations; iteration++) {
            //iterate over every cell
            for(y = 0; y < mapHeight; y++) {
                for(x = 0; x < mapWidth; x++) {
                    var waterCount = 0;
                    //count surrounding cells
                    for(cellSurroundY = y - 1; cellSurroundY < y + 2; cellSurroundY++) {
                        for(cellSurroundX = x - 1; cellSurroundX < x + 2; cellSurroundX++) {
                            if (cellSurroundY < 0
                                || cellSurroundY >= mapHeight
                                || cellSurroundX < 0
                                || cellSurroundX >= mapWidth
                            ) {
                                waterCount++;
                            } else {
                                if(getCell(cellSurroundX, cellSurroundY) === ids.water) {
                                    waterCount++;
                                }
                            }
                        }
                    }

                    if(getCell(x, y) === ids.water) {
                        if(waterCount >= generationInput.fullCellCount
                            || waterCount <= 1 && iteration <= generationInput.fillEmptySpaceIterationLimit)
                        {
                            setCell(ids.water, x, y);
                        } else {
                            setCell(ids.nothing, x, y);
                        }
                    } else {
                        if (getCell(x, y) === ids.nothing) {
                            if(waterCount >= generationInput.emptyCellCount
                                || waterCount <= 1 && iteration <= generationInput.fillEmptySpaceIterationLimit
                            ) {
                                setCell(ids.water, x, y);
                            } else {
                                setCell(ids.nothing, x, y);
                            }
                        }
                    }
                }
            }
        }

        localStorage.setItem('cachedMap', JSON.stringify(mapData));
    };
    var renderMapFromData = function() {
        for(var y = 0; y < mapHeight; y++) {
            for(var x = 0; x < mapWidth; x++) {
                grid.drawCell(x, y, entity[getCell(x, y)].color);
            }
        }
    };

    fillMapData();
    grid.drawBoard();
    generateWater();
    renderMapFromData();
};

var Ant = function() {

};