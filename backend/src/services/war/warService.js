const warDatabase = require('../../database/war/warDatabase');
const clanDB = require('../../database/clan/clanDatabase');
const rankingService = require('../ranking/rankingService');

/******************
 *     GETS
******************/
const getWar = async (id) => {
    const result = await warDatabase.getWar(id);
    return result;
}

const getWars = async () => {
    const result = await warDatabase.getWars();
    return result;
}

const getWarAttacks = async (id) => {
    const result = await warDatabase.getWarAttacks(id);
    return result;
}

/******************
 *    POSTS
******************/ 

/* GLOBAL ACTIONS */

const saveAttacks = async (attacks) => {
    for(let i = 0; i < attacks.length; i++) {
        await warDatabase.saveAttacks(attacks[i]);
    }
    return true;
}

const leagueGroups = (clans, clansGroup, groups) => {
    const groups_obj = [];
    const abc = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    for (let group = 0; group < groups; group++) {
        groups_obj[group] = {};
        groups_obj[group].group = abc[group];
        groups_obj[group].clans = [];
        for (let team = group*clansGroup; team < (group+1)*clansGroup && team <= clans.length; team++) {
            groups_obj.find(obj => obj.group == abc[group]).clans.push({clan:clans[team].tag})
        }
    }
    return groups_obj;
}
/* gets all the avalible matches */
const setWars = (fase, group, clans) => {
    const matches = [];
    for(let i=0; i< clans.length; i++){
      let x = i+1;
      while(x < clans.length){
        matches.push({team:clans[i].clan, opponent:clans[x].clan, fase, group })
        x++;
      }
    }
    return setLeagueMatchesOrder(matches, clans)
}

const setLeagueMatchesOrder = (matches, clans) => {
    let playedWars = [];
    let week = 0;
    while (playedWars.length < matches.length) {
        week++;
        let usedTeams = [];
        let contador = 0;
        // get one week wars
        while(contador < matches.length || usedTeams.length == clans.length/2) {
            let clanA = matches[contador].team;
            let clanB = matches[contador].opponent;
            // check if both clans are available this week
            if(usedTeams.indexOf(clanA) == -1 && usedTeams.indexOf(clanB) == -1){
                //check if war is available
                if(playedWars.indexOf(matches[contador]) == -1){
                    playedWars.push(matches[contador]);
                    usedTeams.push(clanA, clanB);
                    matches[contador].round = week;
                }
            }
            contador++;
        } 
    }
    return matches;
}

const playoffFormat = (teams, fase) => {
    const rounds = Math.log(teams) / Math.log(2);
    const matches = [];
    const team = '#0000';

    for (let i = 1; i < rounds+1; i++){
      const matches_index = teams/(2**i)
      let next_match = 1;
      for (let j = 1; j < matches_index+1; j++){
        matches.push({round:`R${i}-${j}`, next_round:`R${i+1}-${next_match}`, fase, team, opponent:team})
        if(j%2 == 0) next_match++;
      }
    }
    return matches;
}

/* FIRST FASE */

const firstFase = async (fase) => {
    // TODO: check if the first fase is League or playoff
    const matches = await firstFaseLeague(fase);
    let result;
    if(matches) {
        result = await warDatabase.createLeagueWars(matches, fase.type);
    }
    return result;
}

const firstFaseLeague = async (fase) => {
    
    try {
        const clans = await clanDB.getClans();
        const clansGroup = fase.teams / fase.groups;
        
        while (fase.teams > clans.length) {
            clans.push({tag:'#0000', name:'NONE', short_name: 'NON'});
        }

        const groups_obj = leagueGroups(clans, clansGroup, fase.groups);
        const wars = [];
        for(let i = 0; i < groups_obj.length; i++) {
            wars.push(setWars(fase.fase, groups_obj[i].group, groups_obj[i].clans))
        }
        
        return wars;

    } catch (err){
        console.log(err);
        return false;
    }

}

/* CONSECUTIVE FASE */

const consecutiveFase = async (fase) => {
    // TODO: check if the first fase is League or playoff
    const matches = await playoffFase(fase);
    let result;
    if(matches) {
        result = await warDatabase.createPlayoffWars(matches, fase.type);
    }
    return result;
}

const playoffFase = async (fase) => {
    try {
        const wars = playoffFormat(fase.teams, fase.fase);
        return wars;
    } catch (err) {
        console.log(err);
        return false;
    }
}

/******************
 *    DELETE
******************/ 
const restartTournament = async () => {
    const result = await warDatabase.restartTournament();
    return result;
}

/******************
 *     PATCH
******************/ 
const updateWar = async (id, war) => {
    const result = await warDatabase.updateWar(id, war);
    return result;
}

/* NEW FASE WARS */
const setFaseWars = async (fase) => {
    // TODO: CHECK NEW FASE FORMAT
    const faseDetails = await warDatabase.getFaseDetails(fase, fase-1);
    // playoff case
    setPlayOffWars(faseDetails, fase);
    return true;
}

const setPlayOffWars = async (warsDB, fase) => {
    const group_id = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const actualFase = warsDB.filter(obj => obj.fase === fase);

    const num_teams = parseInt(actualFase.length)*2;
    const distinct_groups = warsDB[0].num_groups;
    const teams_group = num_teams/distinct_groups;

    const groups = [];
    for(let i=0; i < distinct_groups; i++) {
        const teams = await rankingService.getTopClans(teams_group, group_id[i], parseInt(fase)-1);
        groups.push({group:group_id[i], teams});
    }

    const wars = [];
    for (let i=0; i < distinct_groups; i+=2) {
        match2Groups(teams_group, wars, groups[i].teams,groups[i+1].teams);
    }
    shuffleArray(wars);

    console.log(wars)
    
    for (let i=0; i < actualFase.length; i++) {
        await updateWar(actualFase[i].id, wars[i])
    }
}

const match2Groups = (teams_group, wars, teamA, teamB) => {
    console.log(teamA)
    for( let cA = 0; cA < teams_group; cA++ ) {
            wars.push({clan_A:teamA[cA].clan, clan_B:teamB[teams_group-1-cA].clan});
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

/* next playoff match */
const setNextPlayoffMatch = async (war, attacks) => {
    const round = war.round;
    const next_round = war.next_round;
    clanA_attacks = attacks.filter(obj => obj.clan === war.clan_A);
    const a_stars = clanA_attacks.reduce((accumulator, obj) => accumulator + obj.stars, 0);
    const a_percentage = clanA_attacks.reduce((accumulator, obj) => accumulator + obj.percentage, 0);
    const a_duration = clanA_attacks.reduce((accumulator, obj) => accumulator + obj.duration, 0);
      
    clanB_attacks = attacks.filter(obj => obj.clan === war.clan_B);
    const b_stars = clanB_attacks.reduce((accumulator, obj) => accumulator + obj.stars, 0);
    const b_percentage = clanB_attacks.reduce((accumulator, obj) => accumulator + obj.percentage, 0);
    const b_duration = clanB_attacks.reduce((accumulator, obj) => accumulator + obj.duration, 0);

    let winner;
    if(a_stars > b_stars) {
        winner = war.clan_A;
    } else if (a_stars == b_stars) {
        if(a_percentage > b_percentage) {
            winner = war.clan_A;
        } else if (a_percentage == b_percentage) {
            if(a_duration < b_duration) {
                winner = war.clan_A;
            } else if (a_duration == b_duration) {
                winner = war.clan_B;
            } else winner = war.clan_B; // WIN B
        } else winner = war.clan_B; // WIN B
    } else winner = war.clan_B; // WIN B

    const next_round_team = getNextRoundLocalorVisitant(round);
    await warDatabase.updateWarNoId(next_round, war.fase, next_round_team, winner)

};

const getNextRoundLocalorVisitant = (round) => {
    round = parseInt(round.split('-')[1]);
    let result;
    if (round % 2 === 0) result = 'clan_A';
    else result = 'clan_B';
    return result;
  };

module.exports = { getWar, getWarAttacks, getWars, firstFase, consecutiveFase, restartTournament, setFaseWars, setNextPlayoffMatch, updateWar, saveAttacks };