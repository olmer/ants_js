/**
 *
 * @param map Map
 * @param ais []
 * @constructor
 */
var Engine = function (map, ais) {
    var numberOfPlayers = map.numberOfPlayers,
        turnsLimit = 10,
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
                map.turnIteration();

                for (playerNumber = 0; playerNumber < numberOfPlayers; playerNumber++) {

                }

                console.log('before render');
                map.renderMapFromData();
                setTimeout(turnIteration, 1000);
                turn++;
            }
        };
        turnIteration();
        isRunning = false;
    };
};