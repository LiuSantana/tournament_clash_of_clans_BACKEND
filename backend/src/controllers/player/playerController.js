// require('dotenv').config();
const config = require('../../../config.json')
const validators = require('../validators');

const playerService = require('../../services/player/playerService');
const clanService = require('../../services/clan/clanService');


/******************
 *     GETS
******************/
// get player
const getPlayer = async (req, res) => {
    let tag = req.params.tag;
    if(tag){
        try {
            tag = validators.validateTag(tag);
            if(tag){
                let player = await playerService.getPlayer(tag);
                if(player) res.status(200).send(player);
                else res.status(404).send({'error':'Player not found'})
            } else res.status(422).send({'error':'Invalid clan tag format'});
        } catch (err) {
            console.log(err);
            res.status(500).send({'error':'Internal error'});
        }
    } else res.satus(422).send({'error':'Empty params'});
};

const validatePlayer = async (req, res) => {
    let tag = req.params.tag;
    if(tag){
        try {
            tag = validators.validateTag(tag);
            if(tag) {
                tag = await validators.getPlayer(tag);
                if(tag){
                    res.status(200).send({data:'OK'});
                } else res.status(422).send({'error':'Player does not exist'});
            } else res.status(422).send({error:'Invalid clan tag format'});
        } catch (err) {
            console.log(err);
            res.status(500).send({'error':'Internal error'});
        }
    } else res.satus(422).send({'error':'Empty params'});
};

/******************
 *     POSTS
******************/
// new player
const newPlayer = async (req, res) => {
    let tag = req.body.tag;
    let clan = req.body.clan;

    try {
        if(tag && clan){
            tag = validators.validateTag(tag);
            if(tag){
                clan = validators.validateTag(clan);
                if(clan) {
                    const player = await validators.getPlayer(tag);
                    if(player){
                        player.clan = clan;
                            const clanPlayers = await clanService.getClanPlayers(clan);
                            if(clanPlayers.length < config.MAX_PLAYERS_PER_TEAM) {
                                const response = await playerService.newPlayer(player);
                                if(response) {
                                    if(!response.error)res.status(200).send({'data':response});
                                    else res.status(409).send(response);
                                } else res.status(400).send({'error':'Error adding player'})
                            } else res.status(403).send({'error':'Too many players'})
                    } else res.status(404).send({'error':'Player not found'});
                } else res.status(422).send({'error':'Invalid clan tag format'});
            } else res.status(422).send({'error':'Invalid player tag format'});
        } else res.status(422).send({'error':'Empty params'});
    } catch(err){
        console.log(err)
        res.status(500).send({'error':err})
    }
}

/******************
 *     DELETES
******************/
const removePlayer = async (req, res) => { 
    let tag = req.params.tag;

    if(tag){
        try {
            tag = validators.validateTag(tag);
            if(tag){
                const result = await playerService.deletePlayer(tag);
                if(result){
                    if(!result.error) res.status(200).send({'data':'Player deleted successfully'});
                    else res.status(404).send({'error':'Player not found'});
                } else res.status(400).send({'error':'Error deleting player'});
            } else res.status(422).send({'error':'Invalid player tag format'});
        } catch(err){
            console.log(err);
            res.status(500).send({'error':err});
        }
    } else res.status(422).send({'error':'Empty params'});
}


module.exports = { newPlayer, removePlayer, getPlayer, validatePlayer };