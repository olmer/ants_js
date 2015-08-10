/**
 *
 * @param map Map
 * @param ais []
 * @constructor
 */
var Engine = function (map, ais) {
    var numberOfPlayers = map.numberOfPlayers,
        turnsLimit = 1,
        isRunning = false;

    if (ais.length) {
        this.runSimulation = function () {
            if (isRunning) {
                return;
            }
            isRunning = true;
            var turn = 0, playerId;
            var turnIteration = function () {
                if (turn < turnsLimit) {
                    map.turnIterationBeforePlayers(turn);

                    for (playerId = 1; playerId <= numberOfPlayers; playerId++) {
                        ais[playerId - 1].setInput(map.getDataForPlayer(playerId));
                        ais[playerId - 1].processTurn();
                        map.setDataFromPlayer(ais[playerId - 1].getOutput());
                    }

                    map.turnIterationAfterPlayers(turn);

                    console.log('before render turn ' + turn);
                    map.renderMapFromData();
                    setTimeout(turnIteration, 1000);
                    turn++;
                }
            };
            turnIteration();
            isRunning = false;
        };
    }
};
