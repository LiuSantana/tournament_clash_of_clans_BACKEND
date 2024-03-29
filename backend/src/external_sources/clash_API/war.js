const conf = require('./conf.json');
const axios = require('axios');
const warJSON = require('./war.json');


const getWar = async (clanA, clanB) => {
    let war;
    if(conf.development) war = await getWar_development(clanA, clanB);
    else war = await getWar_prodution(clanA, clanB);
    return war;
}

const getWar_prodution = async (clanA, clanB) => {
    const apiUrl = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(clanA)}/currentwar`;
    let result = {};
    await axios.get(apiUrl, {
        headers: {
            Authorization: `Bearer ${conf.TOKEN}`
        }
    })
    .then(response => {
        if(response.status == 200) {
            if (response.data.state == 'warEnded'){
                war = response.data;
                if(war.clan.tag == clanA && war.opponent == clanB) {
                    result = war;
                } else result = { error: 'Different teams in war'}
            } else result = {error: 'war not endend'}
        }
    })
    .catch(error => {
        if(error.response.status == 403 && error.response.data.reason == 'accessDenied' ) {
            result = {'error':'war log not public'};
        } else result = {'error':'Error al hacer la solicitud', message: error.message};
    });

    return result
}

const getWar_development = async (clanA, clanB) => {
    warJSON.clan.tag = clanA;
    warJSON.opponent.tag = clanB;
    return warJSON
}

module.exports = { getWar }