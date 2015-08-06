var Entity = function (data) {
    this.color = data.color || '#000';
};

var Map = function (numberOfPlayers) {
    numberOfPlayers = numberOfPlayers || 0;
    this.numberOfPlayers = numberOfPlayers;

    var ids = {
            nothing: 0,
            ant: 1,
            water: 2,
            food: 3,
            hive: 4
        },
        entity = {
            [ids.nothing]: new Entity({color: '#FFF'}),
            [ids.ant]: new Entity({color: '#00FF9A'}),
            [ids.water]: new Entity({color: '#0AF'}),
            [ids.food]: new Entity({color: '#FFF900'}),
            [ids.hive]: new Entity({color: '#714F54'})
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

    var storeLocalData = function (key, data) {
        localStorage.setItem('ants.map.' + key, JSON.stringify(data));
    };
    var getLocalData = function (key) {
        return JSON.parse(localStorage.getItem('ants.map.' + key));
    };

    var getCell = function (x, y) {
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        return mapData[y][x];
    };
    var setCell = function (entityId, x, y) {
        entityId = parseInt(entityId, 10);
        if (typeof entity[entityId] === 'undefined') {
            throw new Error('Invalid entity type: ' + entityId);
        }
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        mapData[y][x] = entityId;
    };

    var grid = new Grid(mapHeight, mapWidth);
    var initEmptyMap = function () {
        for (var y = 0; y < mapHeight; y++) {
            mapData[y] = [];
            for (var x = 0; x < mapWidth; x++) {
                setCell(ids.nothing, x, y);
            }
        }
    };
    var generateWater = function () {
        var cellSurroundX, cellSurroundY;

        if (getLocalData('mapData')) {
            mapData = getLocalData('mapData');
            return;
        }

        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                if (Math.random() < generationInput.probabilityOfWater) {
                    setCell(ids.water, x, y);
                }
            }
        }
        //number of smoothen iteration
        for (var iteration = 0; iteration < generationInput.smoothenIterations; iteration++) {
            //iterate over every cell
            for (y = 0; y < mapHeight; y++) {
                for (x = 0; x < mapWidth; x++) {
                    var waterCount = 0;
                    //count surrounding cells
                    for (cellSurroundY = y - 1; cellSurroundY < y + 2; cellSurroundY++) {
                        for (cellSurroundX = x - 1; cellSurroundX < x + 2; cellSurroundX++) {
                            if (cellSurroundY < 0
                                || cellSurroundY >= mapHeight
                                || cellSurroundX < 0
                                || cellSurroundX >= mapWidth
                            ) {
                                waterCount++;
                            } else {
                                if (getCell(cellSurroundX, cellSurroundY) === ids.water) {
                                    waterCount++;
                                }
                            }
                        }
                    }

                    if (getCell(x, y) === ids.water) {
                        if (waterCount >= generationInput.fullCellCount
                            || waterCount <= 1 && iteration <= generationInput.fillEmptySpaceIterationLimit) {
                            setCell(ids.water, x, y);
                        } else {
                            setCell(ids.nothing, x, y);
                        }
                    } else {
                        if (getCell(x, y) === ids.nothing) {
                            if (waterCount >= generationInput.emptyCellCount
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

        storeLocalData('mapData', mapData);
    };

    var renderMapFromData = function () {
        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                grid.drawCell(x, y, entity[getCell(x, y)].color);
            }
        }
    };

    var addHives = function (qty) {
        var x, y, cellEmpty;
        var cachedHives = getLocalData('hives');
        cachedHives = cachedHives || [];
        for (var i = 0; i < qty; i++) {
            cellEmpty = false;
            cachedHives[i] = cachedHives[i] || {};
            while (!cellEmpty) {
                x = cachedHives[i]['x'] || Math.floor(Math.random() * mapWidth);
                y = cachedHives[i]['y'] || Math.floor(Math.random() * mapHeight);
                if (getCell(x, y) === ids.nothing) {
                    cellEmpty = true;
                    setCell(ids.hive, x, y);
                    cachedHives[i]['x'] = x;
                    cachedHives[i]['y'] = y;
                }
            }
        }

        storeLocalData('hives', cachedHives);
    };

    initEmptyMap();
    generateWater();
    addHives(numberOfPlayers);

    grid.drawBoard();
    renderMapFromData();
};
