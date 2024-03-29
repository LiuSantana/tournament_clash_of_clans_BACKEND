const conn = require('../mysql');


/******************
 *     GETS
******************/
const getGroups = async (fase) => {
    const connection = await conn.connection();

    const sql = "select distinct(tournament_group) from war where fase = ?";
    try {
        const [rows, fields] = await connection.execute(sql, [fase]);
        return rows
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const getWar = async (id) => {
    const connection = await conn.connection();

    const sql = "SELECT w.*, (SELECT COUNT(id) FROM WAR WHERE state = 'to start' AND fase = w.fase) AS last_match FROM WAR w WHERE w.id = ?;";
    try {
        const [rows, fields] = await connection.execute(sql, [id]);
        return rows[0]
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const getFaseDetails = async (fase, lastFase) => {
    console.log(lastFase)
    const connection = await conn.connection();

    sql = `select *,
        (select count(distinct(tournament_group)) from war where fase = ? AND (round LIKE 'R1%' || round = '-' || round = NULL)) as num_groups
        from war
        where (fase = ? || fase = ?) AND (round LIKE 'R1%' || round = '-' || round = NULL);`
    try {
        const [rows, fields] = await connection.execute(sql, [lastFase, fase, lastFase]);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const getWars = async () => {
    const connection = await conn.connection();

    const sql = "SELECT * FROM WAR_VIEW";
    try {
        const [rows, fields] = await connection.execute(sql);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}



/******************
 *    POSTS
******************/ 

const saveAttacks = async (attack) => {
    const connection = await conn.connection();

    const sql = "INSERT INTO ATTACKS (tag,clan,war,stars,percentage,duration) VALUES (?,?,?,?,?,?)";
    try {
        const [rows, fields] = await connection.execute(sql, [attack.player, attack.clan, attack.id, attack.stars, attack.percentage, attack.duration]);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const createLeagueWars = async (wars, format) => {
    const connection = await conn.connection();

    const sql = "INSERT INTO WAR (clan_A, clan_B, fase, format, tournament_group) VALUES(?,?,?,?,?)";
    try {
        for (let i = 0; i < wars.length; ++i) {
            for (let j = 0; j < wars[i].length; ++j) {
                let war = wars[i][j];
                const [rows, fields] = await connection.execute(sql, [war.team, war.opponent, war.fase, format, war.group]);
            }
        }
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}


const createPlayoffWars = async (wars, format) => {
    const connection = await conn.connection();

    const sql = "INSERT INTO WAR (clan_A, clan_B, fase, format, round, next_round) VALUES(?,?,?,?,?,?)";
    try {
        for (let i = 0; i < wars.length; ++i) {
            let war = wars[i];
            const [rows, fields] = await connection.execute(sql, [war.team, war.opponent, war.fase, format, war.round, war.next_round]);
        }
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

/******************
 *    DELETE
******************/ 
const restartTournament = async () => {
    const connection = await conn.connection();

    const sql = "TRUNCATE TABLE WAR";
    try {
        const [rows, fields] = await connection.execute(sql);
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}


/******************
 *     PATCH
******************/ 
const updateWar = async (id, war) => {
    const connection = await conn.connection();

    let updateQuery = 'UPDATE WAR SET';
    const updateValues = [];
    
    for (const field in war) {
      updateQuery += ` ${field} = ?,`;
      updateValues.push(war[field]);
    }
    
    updateQuery = updateQuery.slice(0, -1); // delete last ','
    updateQuery += ' WHERE id = ?';
    updateValues.push(id);


    try {
        const [rows, fields] = await connection.execute(updateQuery, updateValues);
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const updateWarNoId = async (next_round, fase, next_round_team, winner) => {
    const connection = await conn.connection();
    const sql = `UPDATE WAR SET ${next_round_team} = ? WHERE round = ? AND fase = ? `;
    try {
        const [rows, fields] = await connection.execute(sql, [winner, next_round, fase]);
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

module.exports = { getGroups, getWar, getWars, getFaseDetails, createLeagueWars, createPlayoffWars, restartTournament, updateWar, updateWarNoId, saveAttacks };