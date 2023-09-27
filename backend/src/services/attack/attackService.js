const attacksDatabase = require('../../database/attack/attacksDatabase');


/******************
 *     GETS
******************/
const getAttacks = async () => {
    const attacks = await attacksDatabase.getAttacks();
    return attacks;
}

module.exports = { getAttacks };