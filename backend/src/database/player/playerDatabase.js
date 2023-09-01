const conn = require('../mysql');


/******************
 *     GETS
******************/
const getPlayer = async (player) => {
    const connection = await conn.connection();

    const sql = "SELECT * FROM PLAYER where tag = ?";
    try{
        const [rows, fields] = await connection.execute(sql, [player]);
        console.log(rows)
        return rows;
    } catch(err){
        console.error(err);
    } finally {
        connection.release();
    }
    return false;

}


/******************
 *     POSTS
******************/

const newPlayer = async (player) => {
    const connection = await conn.connection();
    const sql = "insert into PLAYER (tag, name, clan) VALUES (?, ?, ?)";
    try{
        const [rows, fields] = await connection.execute(sql, [player.tag, player.name, player.clan]);
        return player;
    }catch(err){
        console.error(err);
        if(err.code == 'ER_DUP_ENTRY') return {'error':'already exists'};
        else if(err.code == 'ER_NO_REFERENCED_ROW_2') return {'error':'clan does not exist'};

    } finally {
        connection.release();
    }
    return false;
}


/******************
 *    DELETES
******************/ 

const deletePlayer = async (player) => {
    const connection = await conn.connection();
    const sql = "delete from PLAYER where tag = ?";
    try{
        const [rows, fields] = await connection.execute(sql, [player]);
        console.log(rows)
        if(rows.affectedRows == 0) return {'error':'player does not exist'};
        return rows;
    }catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;

}

module.exports = { newPlayer, deletePlayer, getPlayer };