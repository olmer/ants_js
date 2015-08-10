var Map = function (numberOfPlayers) {
    var showPaths = true,
        idCounter = 1,
        entitiesIds = {
            nothing: 0,
            ant: 1,
            water: 2,
            food: 3,
            hive: 4
        },
        entityData = {
            [entitiesIds.nothing]: {color: '#FFF'},
            [entitiesIds.ant]: {color: '#F00'},
            [entitiesIds.water]: {color: '#0AF'},
            [entitiesIds.food]: {color: '#000386'},
            [entitiesIds.hive]: {color: '#714F54'}
        },
        layers = {
            effects: 3,
            object: 2,
            fringe: 1,
            base: 0
        },
        mapData = {
            [layers.base]: {},
            [layers.fringe]: {},
            [layers.object]: {},
            [layers.effects]: {}
        },
        generationInput = {
            probabilityOfWater: 0.27,
            emptyCellCount: 5,
            fullCellCount: 4,
            smoothenIterations: 5,
            fillEmptySpaceIterationLimit: 2
        },
        foodCount = 0,
        foodLimit = 12,
        mapHeight = 30,
        mapWidth = 70,
        sightRadius = 9,
        sightMap = function () {
            var result = [];
            for (var i = 0; i < sightRadius * 2 + 1; i++) {
                result[i] = [];
                for (var j = 0; j < sightRadius * 2 + 1; j++) {
                    result[i][j] = Math.sqrt(
                            Math.pow((sightRadius - i), 2) + Math.pow((sightRadius - j), 2)
                        ) <= sightRadius;
                }
            }
            return result;
        } (),
        grid = new Grid(mapHeight, mapWidth),
        players = {},
        entitiesPool = {};

    var Entity = function (data) {
        data = data || {};
        this.id = idCounter++;
        entitiesPool[this.id] = this;
    };

    var Hive = function (data) {
        Entity.call(this, data);

        data = data || {};

        this.type = entitiesIds.hive;
        this.x = data.x;
        this.y = data.y;
        this.ownerId = data.playerId;
    };
    Hive.prototype = Object.create(Entity.prototype);
    Hive.prototype.constructor = Hive;

    var Ant = function (data) {
        Entity.call(this, data);

        data = data || {};

        this.type = entitiesIds.ant;
        this.x = data.x;
        this.y = data.y;
        this.ownerId = data.playerId;
    };
    Ant.prototype = Object.create(Entity.prototype);
    Ant.prototype.constructor = Ant;

    var Player = function (id) {
        this.id = id;
        this.hive = null;
        this.ants = {};
        this.antsToSpawn = 0;
    };

    this.numberOfPlayers = numberOfPlayers || 0;

    var getRandomCoordX = function () {
        return Math.floor(Math.random() * mapWidth);
    };
    var getRandomCoordY = function () {
        return Math.floor(Math.random() * mapHeight);
    };

    var generatePlayers = function () {
        for (var id = 1; id <= numberOfPlayers; id++) {
            players[id] = new Player(id);
        }
    };

    var addHiveToPlayer = function (player, hive) {
        player.hive = hive;
    };

    this.renderMapFromData = function () {
        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                grid.drawCell(x, y, getCellColor(x, y));
            }
        }
    };
    this.turnIterationBeforePlayers = function (turn) {
        checkAndSpawnAntIfPossible(players);
        console.log('create food turn ' + turn);
        generateFood();
    };
    this.turnIterationAfterPlayers = function (turn) {

    };
    this.getDataForPlayer = function (playerId) {
        var dataToReturn = {
            entitiesIds: entitiesIds
        };
        for (var entityId in entitiesPool) {
            if (!entitiesPool.hasOwnProperty(entityId)) {
                continue;
            }
            if (entitiesPool[entityId].ownerId !== playerId) {
                continue;
            }
            if (entitiesPool[entityId].type === entitiesIds.hive) {
                dataToReturn.hive = entitiesPool[entityId];
                continue;
            }
            if (entitiesPool[entityId].type === entitiesIds.ant) {
                dataToReturn.ants = dataToReturn.ants || {};
                entitiesPool[entityId].sight = getAntSight(entitiesPool[entityId]);
                dataToReturn.ants[entityId] = entitiesPool[entityId];
            }
        }

        return dataToReturn;
    };
    this.setDataFromPlayer = function (playerId, data) {
    };

    var isCellVisibleForAnt = function (x, y) {
        return sightMap[y][x];
    };
    var getAntSight = function (ant) {
        var result = {}, i, j,
            x1, y1, x2, y2;
        x1 = ant.x - sightRadius;
        x2 = ant.x + sightRadius;
        y1 = ant.y - sightRadius;
        y2 = ant.y + sightRadius;
        for (i = y1; i <= y2; i++) {
            if (isCoordinateYLegit(i)) {
                result[i] = {};
            }
            for (j = x1; j <= x2; j++) {
                if (isCellVisibleForAnt(i - y1, j - x1) && areCoordinatesLegit(j, i)) {
                    result[i][j] = getCellTopLayerEntityId(j, i);
                }
            }
        }

        return result;
    };

    var setCache = function (key, data) {
        localStorage.setItem('ants.map.' + key, JSON.stringify(data));
    };
    var getCache = function (key) {
        return JSON.parse(localStorage.getItem('ants.map.' + key));
    };
    var isCoordinateXLegit = function (x) {
        return x >= 0 && x < mapWidth;
    };
    var isCoordinateYLegit = function (y) {
        return y >= 0 && y < mapHeight;
    };
    var areCoordinatesLegit = function (x, y) {
        return isCoordinateXLegit(x) && isCoordinateYLegit(y);
    };
    var setCell = function (entityId, x, y, layer) {
        layer = layer || layers.base;
        entityId = parseInt(entityId, 10);
        if (typeof mapData[layer] === 'undefined') {
            throw new Error('Invalid layer: ' + layer);
        }
        if (typeof entityData[entityId] === 'undefined') {
            throw new Error('Invalid entity type: ' + entityId);
        }
        if (typeof mapData[layer][y] === 'undefined') {
            mapData[layer][y] = {};
        }
        if (!areCoordinatesLegit(x, y)) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        mapData[layer][y][x] = entityId;
    };
    var getCell = function (x, y, layer) {
        layer = layer || layers.base;
        if (typeof mapData[layer] === 'undefined') {
            throw new Error('Invalid layer: ' + layer);
        }
        if (!areCoordinatesLegit(x, y)) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        if (typeof mapData[layer][y] === 'undefined') {
            mapData[layer][y] = {};
        }
        return typeof mapData[layer][y][x] !== 'undefined' ? mapData[layer][y][x] : null;
    };
    var getCellTopLayerEntityId = function (x, y) {
        var cellEntityId;
        for (var layerName in layers) {
            if (!layers.hasOwnProperty(layerName)) {
                continue;
            }

            cellEntityId = getCell(x, y, layers[layerName]);
            if (typeof cellEntityId !== 'undefined' && cellEntityId !== null) {
                return cellEntityId;
            }
        }

        return entitiesIds.nothing;
    };
    var getCellColor = function (x, y) {
        return entityData[getCellTopLayerEntityId(x, y)].color;
    };
    var initEmptyMap = function () {
        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                setCell(entitiesIds.nothing, x, y);
            }
        }
    };
    var generateWater = function () {
        var cellSurroundX, cellSurroundY;

        if (getCache('mapData')) {
            mapData = getCache('mapData');
            return;
        }

        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                if (Math.random() < generationInput.probabilityOfWater) {
                    setCell(entitiesIds.water, x, y);
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
                            if (!areCoordinatesLegit(cellSurroundX, cellSurroundY)) {
                                waterCount++;
                            } else {
                                if (getCell(cellSurroundX, cellSurroundY) === entitiesIds.water) {
                                    waterCount++;
                                }
                            }
                        }
                    }

                    if (getCell(x, y) === entitiesIds.water) {
                        if (waterCount >= generationInput.fullCellCount
                            || waterCount <= 1 && iteration <= generationInput.fillEmptySpaceIterationLimit) {
                            setCell(entitiesIds.water, x, y);
                        } else {
                            setCell(entitiesIds.nothing, x, y);
                        }
                    } else {
                        if (getCell(x, y) === entitiesIds.nothing) {
                            if (waterCount >= generationInput.emptyCellCount
                                || waterCount <= 1 && iteration <= generationInput.fillEmptySpaceIterationLimit
                            ) {
                                setCell(entitiesIds.water, x, y);
                            } else {
                                setCell(entitiesIds.nothing, x, y);
                            }
                        }
                    }
                }
            }
        }

        setCache('mapData', mapData);
    };

    var spawnHives = function (players) {
        var x, y, cellEmpty;
        var cachedHives = getCache('hives');
        cachedHives = cachedHives || [];

        for (var playerId in players) {
            if (!players.hasOwnProperty(playerId)) {
                continue;
            }
            playerId = parseInt(playerId, 10);
            cellEmpty = false;
            cachedHives[playerId] = cachedHives[playerId] || {};
            while (!cellEmpty) {
                x = cachedHives[playerId]['x'] || getRandomCoordX();
                y = cachedHives[playerId]['y'] || getRandomCoordY();
                if (getCell(x, y) === entitiesIds.nothing) {
                    cellEmpty = true;

                    setCell(entitiesIds.hive, x, y, layers.fringe);

                    cachedHives[playerId]['x'] = x;
                    cachedHives[playerId]['y'] = y;
                } else {
                    cachedHives[playerId]['x'] = null;
                    cachedHives[playerId]['y'] = null;
                }
            }

            addHiveToPlayer(players[playerId], new Hive({
                playerId: playerId,
                x: x,
                y: y
            }));
            spawnAnt(players[playerId]);
        }

        setCache('hives', cachedHives);
    };

    var checkAndSpawnAntIfPossible = function (players) {
        for (var playerId in players) {
            if (!players.hasOwnProperty(playerId)) {
                continue;
            }
            if (players[playerId].antsToSpawn === 0) {
                continue;
            }
            var x = players[playerId].hive.x, y = players[playerId].hive.y;
            if (getCell(x, y, layers.object) === null) {
                players[playerId].antsToSpawn--;
                spawnAnt(players[playerId]);
            }
        }
    };

    var spawnAnt = function (player) {
        var x = player.hive.x, y = player.hive.y;
        if (getCell(x, y, layers.object) !== null) {
            player.antsToSpawn++;
        } else {
            var newAnt = new Ant({playerId: player.id, x: x, y: y});
            player.ants[newAnt.id] = newAnt;
            setCell(entitiesIds.ant, x, y, layers.object);
        }
    };

    var generateFood = function () {
        var cellEmpty, x, y, cachedFood = getCache('food') || [], food = [];
        while (foodCount < foodLimit) {
            cachedFood[foodCount] = cachedFood[foodCount] || [];
            cellEmpty = false;
            while (!cellEmpty) {
                x = cachedFood[foodCount].x || getRandomCoordX();
                y = cachedFood[foodCount].y || getRandomCoordY();
                if (getCell(x, y) === entitiesIds.nothing) {
                    cellEmpty = true;
                    setCell(entitiesIds.food, x, y, layers.base);
                    foodCount++;

                    food.push({x: x, y: y});
                }
            }
        }

        setCache('food', food);
    };

    generatePlayers();
    initEmptyMap();
    generateWater();
    spawnHives(players);

    grid.drawBoard();
    this.renderMapFromData();
};
