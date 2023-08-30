const rankingDB = require('../../database/ranking/rankingDatabase');

const getTopClans = async (num_clans, group, fase) => {

    const clans = await rankingDB.getTopClans(num_clans, group, fase);
    for (let i = clans.length - num_clans; i <= 0; i++) {
        clans.push({clan:'#0000'})
    }
    return clans;
}


module.exports = { getTopClans };