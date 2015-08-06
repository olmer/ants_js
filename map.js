var Map = function (numberOfPlayers) {

    var idCounter = 1;
    var entitiesPool = {};
    var Entity = function (data) {
        data = data || {};
        this.id = idCounter++;
        entitiesPool[this.id] = this;
    };

    var Hive = function (data) {
        Entity.call(this, data);

        this.type = ids.hive;

        data = data || {};

        this.x = data.x;
        this.y = data.y;
        this.playerId = data.playerId;
    };
    Hive.prototype = Object.create(Entity.prototype);
    Hive.prototype.constructor = Hive;

    var Water = function (data) {
        Entity.call(this, data);
        this.type = ids.water;
    };
    Water.prototype = Object.create(Entity.prototype);
    Water.prototype.constructor = Water;

    var Ant = function (data) {
        Entity.call(this, data);
        this.type = ids.ant;
    };
    Ant.prototype = Object.create(Entity.prototype);
    Ant.prototype.constructor = Ant;

    var Food = function (data) {
        Entity.call(this, data);
        this.type = ids.food;
    };
    Food.prototype = Object.create(Entity.prototype);
    Food.prototype.constructor = Food;

    var Nothing = function (data) {
        Entity.call(this, data);
        this.type = ids.nothing;
    };
    Nothing.prototype = Object.create(Entity.prototype);
    Nothing.prototype.constructor = Nothing;

    var Player = function (id) {
        this.id = id;
        this.hive = null;
        this.ants = {};
    };

    this.numberOfPlayers = numberOfPlayers || 0;

    var ids = {
            nothing: 0,
            ant: 1,
            water: 2,
            food: 3,
            hive: 4
        },
        entityData = {
            [ids.nothing]: {color: '#FFF'},
            [ids.ant]: {color: '#00FF9A'},
            [ids.water]: {color: '#0AF'},
            [ids.food]: {color: '#FFF900'},
            [ids.hive]: {color: '#714F54'}
        },
        layers = {
            base: 0,
            fringe: 1,
            object: 2,
            top: 3
        },
        mapData = {
            [layers.base]: [],
            [layers.fringe]: [],
            [layers.object]: [],
            [layers.top]: []
        },
        generationInput = {
            probabilityOfWater: 0.27,
            emptyCellCount: 5,
            fullCellCount: 4,
            smoothenIterations: 5,
            fillEmptySpaceIterationLimit: 2
        },
        mapHeight = 100,
        mapWidth = 200,
        players = {}
        ;

    var generatePlayers = function () {
        for (var id = 1; id <= numberOfPlayers; id++) {
            players[id] = new Player(id);
        }
    };

    /**
     *
     * @param player Player
     * @param hive
     */
    var addHiveToPlayer = function (player, hive) {
        player.hive = hive;
    };

    this.renderMapFromData = function () {
        for (var y = 0; y < mapHeight; y++) {
            for (var x = 0; x < mapWidth; x++) {
                grid.drawCell(x, y, entityData[getCell(x, y)].color);
            }
        }
    };
    this.turnIteration = function () {
        console.log('create food');
    };

    var storeLocalData = function (key, data) {
        localStorage.setItem('ants.map.' + key, JSON.stringify(data));
    };
    var getLocalData = function (key) {
        return JSON.parse(localStorage.getItem('ants.map.' + key));
    };

    var getCell = function (x, y, layer) {
        layer = layer || layers.base;
        if (typeof mapData[layer] === 'undefined') {
            throw new Error('Invalid layer: ' + layer);
        }
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        if (typeof mapData[layer][y] === 'undefined') {
            mapData[layer][y] = [];
        }
        return mapData[layer][y][x];
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
            mapData[layer][y] = [];
        }
        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
            throw new Error('Invalid cell: ' + x + ':' + y);
        }
        mapData[layer][y][x] = entityId;
    };

    var grid = new Grid(mapHeight, mapWidth);
    var initEmptyMap = function () {
        for (var y = 0; y < mapHeight; y++) {
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

    var spawnHives = function (players) {
        var x, y, cellEmpty;
        var cachedHives = getLocalData('hives');
        cachedHives = cachedHives || [];

        for (var playerId in players) {
            if (!players.hasOwnProperty(playerId)) {
                continue;
            }
            cellEmpty = false;
            cachedHives[playerId] = cachedHives[playerId] || {};
            while (!cellEmpty) {
                x = cachedHives[playerId]['x'] || Math.floor(Math.random() * mapWidth);
                y = cachedHives[playerId]['y'] || Math.floor(Math.random() * mapHeight);
                if (getCell(x, y) === ids.nothing) {
                    cellEmpty = true;

                    setCell(ids.hive, x, y);

                    cachedHives[playerId]['x'] = x;
                    cachedHives[playerId]['y'] = y;
                }
            }

            debugger;
            addHiveToPlayer(players[playerId], new Hive({
                playerId: playerId,
                x: x,
                y: y
            }));
            spawnAnt(players[playerId]);
        }

        console.log(players);

        storeLocalData('hives', cachedHives);
    };

    var spawnAnt = function (player) {
        debugger;
    };

    generatePlayers();
    initEmptyMap();
    generateWater();
    spawnHives(players);

    grid.drawBoard();
    this.renderMapFromData();
};
