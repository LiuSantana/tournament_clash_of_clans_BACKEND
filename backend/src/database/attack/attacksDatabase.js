const conn = require('../mysql');

/******************
 *     GETS
******************/
const getAttacks = async () => {
    const connection = await conn.connection();
    const sql = "select a.*, p.name, count(a.tag) as attacks from ATTACKS as a join PLAYER as p on p.tag = a.tag group by tag, attack_number";
    try{
        const [rows, fields] = await connection.execute(sql);
        return rows;
    } catch(err){
    } finally {
        connection.release();
    }
}

module.exports = { getAttacks };