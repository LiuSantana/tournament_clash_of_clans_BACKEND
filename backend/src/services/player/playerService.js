const playerDatabase = require('../../database/player/playerDatabase');

/******************
 *     GETS
******************/
const getPlayer = async (player) => {
    const response = await playerDatabase.getPlayer(player);
    return response;

};


/******************
 *     POSTS
******************/
const newPlayer = async (player) => {
    const response = await playerDatabase.newPlayer(player);
    return response;
}


/******************
 *     DELETES
******************/
const deletePlayer = async (player) => {
    const response = await playerDatabase.deletePlayer(player);
    return response;
}

module.exports = { newPlayer, deletePlayer, getPlayer };