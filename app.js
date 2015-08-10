var player1AI = function () {
    var food = {};
    this.setInput = function (data) {
        this.turnData = data;
    };
    this.processTurn = function () {
        debugger;
        for (var antId in this.turnData.ants) {
            if (!this.turnData.ants.hasOwnProperty(antId)) {
                continue;
            }

            for (var y in this.turnData.ants[antId].sight) {
                if (!this.turnData.ants[antId].sight.hasOwnProperty(y)) {
                    continue;
                }

                for (var x in this.turnData.ants[antId].sight[y]) {
                    if (!this.turnData.ants[antId].sight[y].hasOwnProperty(x)) {
                        continue;
                    }
                    if (this.turnData.ants[antId].sight[y][x] === this.turnData.entitiesIds.food) {
                        if (typeof food[y] === 'undefined') {
                            food[y] = {};
                        }
                        food[y][x] = true;
                    }
                }
            }
        }
        var resultOfFood = food;
    };
    this.getOutput = function () {};
};
var player2AI = function () {
    this.setInput = function (data) {};
    this.processTurn = function () {};
    this.getOutput = function () {};
};
var ais = [new player1AI(), new player2AI()];
var playersCount = ais.length;
var map = new Map(playersCount);

var engine = new Engine(map, ais);

engine.runSimulation();
