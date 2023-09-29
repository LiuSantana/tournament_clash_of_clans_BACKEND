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

    const sql = "select w.*, ca.name as clan_A_name, ca.short_name as clan_A_short_name, cb.name as clan_B_name, cb.short_name as clan_B_short_name from WAR_VIEW as w JOIN CLAN as ca on ca.tag = w.clan_A JOIN CLAN as cb on cb.tag = w.clan_B"
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

const getWarEnded = async (id) => {
    const connection = await conn.connection();

    const sql = "select w.*, ca.name as clan_A_name, ca.short_name as clan_A_short_name, cb.name as clan_B_name, cb.short_name as clan_B_short_name from WAR_VIEW as w JOIN CLAN as ca on ca.tag = w.clan_A JOIN CLAN as cb on cb.tag = w.clan_B where id = ?"
    try {
        const [rows, fields] = await connection.execute(sql, [id]);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const getWarAttacks = async (id) => {
    const connection = await conn.connection();
    const sql = "select a.*, p.name from ATTACKS as a JOIN PLAYER as p ON a.tag = p.tag where war = ?";

    try {
        const [rows, fields] = await connection.execute(sql, [id]);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
} 

const getRanking = async () => {
    const connection = await conn.connection();
    const sql = "select * from CLASIFICATION_VIEW WHERE clan != '#0000' order by pts desc, stars desc, percentage desc, duration";

    try {
        const [rows, fields] = await connection.execute(sql, []);
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

    const sql = "INSERT INTO ATTACKS (tag,clan,war,stars,percentage,duration,attack_number) VALUES (?,?,?,?,?,?,?)";
    try {
        const [rows, fields] = await connection.execute(sql, [attack.player, attack.clan, attack.id, attack.stars, attack.percentage, attack.duration, attack.attack_number]);
        return rows
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

const saveDefences = async (defence) => {
    console.log(defence)
    const connection = await conn.connection();

    const sql = "INSERT INTO DEFENCES (tag,clan,war,stars,percentage,duration) VALUES (?,?,?,?,?,?)";
    try {
        const [rows, fields] = await connection.execute(sql, [defence.player, defence.clan, defence.id, defence.stars, defence.percentage, defence.duration]);
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

    const sql = "INSERT INTO WAR (clan_A, clan_B, fase, format, tournament_group, round) VALUES(?,?,?,?,?, ?)";
    try {
        for (let i = 0; i < wars.length; ++i) {
            for (let j = 0; j < wars[i].length; ++j) {
                let war = wars[i][j];
                const [rows, fields] = await connection.execute(sql, [war.team, war.opponent, war.fase, format, war.group, war.round]);
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

const updateWarAttack = async (attack) => {
    const connection = await conn.connection();
    const sql = `UPDATE ATTACKS SET stars = ?, percentage = ? WHERE tag = ? AND clan = ? AND war = ?`;
    try {
        const [rows, fields] = await connection.execute(sql, [attack.stars, attack.percentage, attack.tag, attack.clan, attack.war]);
        return true;
        
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

module.exports = { createLeagueWars, createPlayoffWars, getGroups, getRanking, getWar, getWarAttacks, getWarEnded, getWars, getFaseDetails, restartTournament, saveAttacks, saveDefences, updateWarAttack, updateWar, updateWarNoId };