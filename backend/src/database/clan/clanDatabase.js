const conn = require('../mysql');

/******************
 *     GETS
******************/

// get all clans
const getClans = async () => {
    const connection = await conn.connection();
    const sql = "select tag, name, short_name from CLAN where tag != '#0000'"
    try{
        const [rows, fields] = await connection.execute(sql);
        return rows;
    }catch(err){
    } finally {
        connection.release();
    }
}

// get clan by tag
const getClan = async (tag) => {
    const connection = await conn.connection();
    const sql = "select tag, name, short_name from CLAN where tag = ?"
    try{
        const [rows, fields] = await connection.execute(sql, [tag]);
        return rows;
    }catch(err){
    } finally {
        connection.release();
    }
}

const loginClan = async (user) => {
    const connection = await conn.connection();
    const sql = "select * from CLAN where user = ?"
    try{
        const [rows, fields] = await connection.execute(sql, [user]);
        return rows[0];
    }catch(err){
    } finally {
        connection.release();
    }
}

const getClanPlayers = async (tag) => {
    const connection = await conn.connection();
    const sql = "select * from PLAYER where clan = ?"
    try{
        const [rows, fields] = await connection.execute(sql, [tag]);
        return rows;
    }catch(err){
    } finally {
        connection.release();
    }
}


/******************
 *    POSTS
******************/

// create new clan
const newClan = async (clan) => {

    const connection = await conn.connection();
    const sql = "INSERT INTO CLAN(tag, name, short_name, user, password) VALUES (?, ?, ?, ?, ?)";
    try{
        const [rows, fields] = await connection.execute(sql, [clan.tag, clan.name, clan.short_name, clan.user, clan.password]);
        return rows;
    }catch(err){
        if(err.code == 'ER_DUP_ENTRY') return {'error':'already exists'};

    } finally {
        connection.release();
    }
}

/******************
 *    DELETE
******************/

const deleteClan = async (clan) => {

    const connection = await conn.connection();
    const sql = "delete from PLAYER where clan = ? ";
    const sql2 = "delete from CLAN where tag = ? ";
    try{
        const [rows, fields] = await connection.execute(sql, [clan]);
        console.log(rows)
        if(rows) {
            const [rows, fields] = await connection.execute(sql2, [clan]);
            console.log(rows)
        }
        
        return true;
    }catch(err){
        if(err.code == 'ER_DUP_ENTRY') return {'error':'already exists'};

    } finally {
        connection.release();
    }
}


/******************
 *    PATCH
******************/
const editClan = async (tag, data) => { 
    const connection = await conn.connection();
    let sql = "UPDATE clan SET";
    const values = [];
    data.forEach(field => {
        sql += ` ${field.property} = ?,`;
        values.push(field.value)
    })
    sql = sql.slice(0, -1); // delete last ','
    values.push(tag);
    sql += ` WHERE tag = ?`
    
    try{
        const [rows, fields] = await connection.execute(sql, values);
        return rows;
    }catch(err){
        if(err.code == 'ER_DUP_ENTRY') return {'error':'already exists'};

    } finally {
        connection.release();
    }
}


module.exports = { deleteClan,editClan, getClans, getClan,getClanPlayers, loginClan, newClan  };