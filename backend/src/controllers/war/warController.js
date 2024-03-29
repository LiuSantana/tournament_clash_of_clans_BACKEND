const warService = require('../../services/war/warService');
const clash_API = require('../../external_sources/clash_API/war');

/******************
 *     GETS
******************/
const getWars = async (req, res) => {
    try {
        const wars = await warService.getWars();
        if(wars && wars.length>0) res.status(200).send({data:wars});
        else res.status(404).send({'error':'No wars found'})
    } catch (err) {
        console.log(err);
        res.status(500).send({'error':'Internal server error'});
    }
};

/******************
 *     POSTS
******************/

const createTournament = async (req, res) => {
    const error = [];
    let lastFaseTeams = {value:-1};
    let tournament = req.body.tournament;

    if(tournament && tournament.fases){
        tournament.fases = tournament.fases.sort((a, b) => a.fase - b.fase);
        let correct_format = true;
        tournament.fases.forEach(fase => {
            switch(fase.type){
                case "league":
                    if(!checkLeagueFormat(fase, error, lastFaseTeams)) correct_format = false;
                    break;
                case "playoff":
                    if(!checkPlayoffFormat(fase, error, lastFaseTeams)) correct_format = false;
                    break;
                default: res.status(422).send({'error':'Wrong fase format'});
            }
        });

        if(correct_format){
            try {
                let fase1 = await warService.firstFase(tournament.fases[0]);
                let fase2 = true;
                for (let i = 1; i < tournament.fases.length; i++) {
                    if(!await warService.consecutiveFase(tournament.fases[i])) fase2 = false;
                }
                // TODO: fase2
                if(fase1 && fase2) res.status(200).send({'data':'OK'});
                else {
                    await warService.restartTournament(); // truncate table war;
                    res.status(400).send({'error':'could not create wars'})
                }
            } catch(err){
                res.status(500).send({'error':'Internal error'});
            }


        } else res.status(422).send({'error':'Wrong fase format', 'messages':error});
    } else res.status(422).send({'error':'Empty tournament'})
};

/**
 * Check if the league format params are valid
 * groups must be pair
 * teams nº must be logic respective to the previous fases
 * @param {object} fase 
 * @returns boolean
 */
const checkLeagueFormat = (fase, error, lastFaseTeams) => {
    let valid = false;
    const groups = parseInt(fase.groups);
    const teams = parseInt(fase.teams);

    if(groups && teams) {
        if(groups % 2 == 0){
            if(lastFaseTeams.value == -1 || lastFaseTeams.value >= fase.teams) {
                valid = true;
            } else error.push(`fase ${fase.fase}, teams nº is higher than the previous fase`);
        } else error.push(`fase ${fase.fase}, groups nº must be pair`);
    } else error.push(`fase ${fase.fase}, has empty gropus or empty teams`);
    lastFaseTeams.value = teams;

    return valid;
}

/**
 * 
 * @param {object} fase 
 * @returns boolean
 */
const checkPlayoffFormat = (fase, error, lastFaseTeams) => {
    let valid = false;
    const teams = parseInt(fase.teams);

    if(teams && teams > 0) {
        if(teams > 0 && (teams & (teams - 1)) == 0){
            if( lastFaseTeams.value >= fase.teams ) {
                valid = true;
            } else error.push(`fase ${fase.fase}, teams nº is higher than the previous fase`);
        } else error.push(`fase ${fase.fase}, teams nº must be 2^x`);
    } else error.push(`fase ${fase.fase}, has empty teams`);
    lastFaseTeams.value = teams;

    return valid;
}

/***********
 *  END WAR
 ***********/
const endWar = async (req, res) => {
    // TODO: get war from db by id
    // TODO: retrieve war from clash API
    // TODO: check actual fase status

    const id = req.params.id;
    if(id){
        try {
            const war = await warService.getWar(id);
            if(war){
                if(war.state == 'to start') {
                    const warJSON = await clash_API.getWar(war.clan_A, war.clan_B);
                    if(warJSON) {
                        if(!warJSON.error) {
                            const attacks = [];
                            getAttacks(id, warJSON.clan, attacks);
                            getAttacks(id, warJSON.opponent, attacks);

                            // SAVE ATTACKS IN BD
                            // await warService.saveAttacks(attacks);
                            // await warService.updateWar(id, {state:'finished'});

                            if(war.format == 'league'){
                                if(war.last_match == 1) { // check if it is the last match of the fase
                                    await warService.setFaseWars(parseInt(war.fase)+1)
                                } // league matches doesnt influence the other mathces
                            } else { // playoff -> winner to next round
                                await warService.setNextPlayoffMatch(war, attacks);
                            }

                            res.status(200).send({data: 'OK'})

                        } else res.status(422).send(warJSON);
                    } else res.status(500).send({'error':'Internal error'});
                } else res.status(409).send({'error':'war data is already saved'});
            } else res.status(422).send({'error':'War does not exist'});
        } catch (e) {
            console.log(e)
            res.status(500).send({'error':'Internal error'});
        }
    } else res.status(422).send({'error': 'Empty params'});

}

/**
 * get all players attacks from a war
 * @param {JSON} JSON 
 * @param {ARRAY} attacks 
 */
const getAttacks = (id, JSON, attacks) => {
    const clan = JSON.tag;
    JSON.members.forEach( m => {
        const player = m.tag;
        if(m.attacks) {
            m.attacks.forEach( a => {
                attacks.push({id, clan, player, stars:a.stars, percentage:a.destructionPercentage, duration:a.duration})
            })
        }
    });
}


module.exports = { createTournament, getWars, endWar };