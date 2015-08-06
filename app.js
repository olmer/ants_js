var player1AI = function (data) {
};
var player2AI = function (data) {
};
var ais = [player1AI, player2AI];
var playersCount = ais.length;
var map = new Map(playersCount);

var engine = new Engine(map, ais);

engine.runSimulation();
