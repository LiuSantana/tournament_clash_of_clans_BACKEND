const clansDatabase = require('../../database/clan/clanDatabase');


/******************
 *     GETS
******************/

// get all clans
const getClans = async () => {
    const clans = await clansDatabase.getClans();
    return clans;
}

// get clan by tag
const getClan = async (tag) => {
    const clans = await clansDatabase.getClan(tag);
    return clans;
}

const getClanPlayers = async (tag) => {
    const clans = await clansDatabase.getClanPlayers(tag);
    return clans;
}

// get clan by user
const loginClan = async (user) => {
    const clans = await clansDatabase.loginClan(user);
    return clans;
}

/******************
 *     POSTS
******************/

// create new clan
const newClan = async (clan) => {
    const clans = await clansDatabase.newClan(clan);
    return clans;
}

/******************
 *     DELETE
******************/
const deleteClan = async (clan) => {
    const clans = await clansDatabase.deleteClan(clan);
    return clans;
}

/******************
 *     PATCH
******************/
const editClan = async (tag, data) => {
    const clans = await clansDatabase.editClan(tag, data);
    return clans;

}

module.exports = { editClan, deleteClan, getClans, getClan, loginClan, newClan, getClanPlayers }