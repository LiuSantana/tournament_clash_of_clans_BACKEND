const attackService = require("../../services/attack/attackService");


/******************
 *     GETS
******************/
const getAttacks = async (req, res) => {
    try {
        let attacks = await attackService.getAttacks();
        if(attacks) res.status(200).send(attacks);
        else res.status(500).send({error: 'Internal server error'});
    } catch (err) {
        console.log(err);
        res.status(500).send({error: 'Internal server error'});
    }
};

module.exports = { getAttacks };