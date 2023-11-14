const conn = require('../mysql');


/******************
 *     GETS
******************/
const getTopClans = async (num_clans, group,  fase) => {
    const connection = await conn.connection();

    const sql = "SELECT clan from CLASIFICATION_VIEW where fase = ? AND tournament_group = ? order by win DESC, draw DESC, stars DESC, percentage DESC, duration LIMIT ?";
    try {
        const [rows, fields] = await connection.execute(sql, [fase, group, num_clans]);
        return rows
    } catch(err){
        console.error(err);

    } finally {
        connection.release();
    }
    return false;
}

module.exports = { getTopClans };
