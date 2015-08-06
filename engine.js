/**
 *
 * @param map Map
 * @param ais []
 * @constructor
 */
var Engine = function (map, ais) {
    var numberOfPlayers = map.numberOfPlayers,
        turnsLimit = 3,
        isRunning = false;

    if (ais.length)

    this.runSimulation = function () {
        if (isRunning) {
            return;
        }
        isRunning = true;
        var turn = 0, playerNumber;
        var turnIteration = function () {
            if (turn < turnsLimit) {
                map.turnIterationBeforePlayers(turn);

                for (playerNumber = 0; playerNumber < numberOfPlayers; playerNumber++) {

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
};