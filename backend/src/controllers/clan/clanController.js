
const validators = require('../validators');
const clanService = require('../../services/clan/clanService');
const crypto = require('crypto');


/******************
 *     GETS
******************/

// get all clans
const getClans =  async (req, res) => {
    try{
        const clans = await clanService.getClans();
        if(clans.length > 0) res.status(200).send({'data':clans});
        else res.status(200).send({'data':[]});
    } catch(err){
        console.log(err);
        res.status(500).send({'error':err})
    }
}

// get clan by tag
const getClan = async (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    if(tag){
        tag = validators.validateTag(tag)
        if(tag){ // if regex is true
            try{
                const clan = await clanService.getClan(tag);
                if(clan) res.status(200).send({'data':clan});
                else res.status(404).send({'error':'not found'});
            } catch(err){
                console.log(err);
                res.status(500).send({'error':err});
            }
        } else res.status(422).send({'error':'Invalid tag format'});
    } else res.status(422).send({'error':'Empty tag'});
}

const getClanPlayers = async (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    if(tag){
        tag = validators.validateTag(tag)
        if(tag){ // if regex is true
            try{
                const clan = await clanService.getClanPlayers(tag);
                if(clan) res.status(200).send({'data':clan});
                else res.status(404).send({'error':'not found'});
            } catch(err){
                console.log(err);
                res.status(500).send({'error':err});
            }
        } else res.status(422).send({'error':'Invalid tag format'});
    } else res.status(422).send({'error':'Empty tag'});
}



/******************
 *     POSTS
******************/
function hashStringLimited(inputString, limit) {
    if (inputString.length > limit) {
      inputString = inputString.substr(0, limit);
    }
  
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}

// create a new clan
const newClan = async (req, res) => {
    let tag = req.body.tag;
    const name = req.body.name;
    const short_name = req.body.short_name;
    const user = req.body.user;
    let password = req.body.password;

    if(tag && name && short_name && user && password) {
        // password = hashStringLimited(password, 500);
        tag = validators.validateTag(tag);
        if(tag) { // check tag regex
            if(short_name.length > 3) res.status(422).send({'error':'short_name too long'});
            if(name.length > 50) res.status(422).send({'error':'name too long'});

            // validate tag with clash API
            const valid = await validators.validClan(tag)
            if(valid){
                try {
                    result = await clanService.newClan({tag, name, short_name, user, password})
                    if(result) {
                        if(result.error) res.status(409).send(result);
                        else res.status(200).send({'data':result});
                    } else res.status(400).send({'error':'Error creating clan'})
                } catch(err) {
                    console.error(err);
                    res.status(500).send({'error':err});
                }
            } else res.status(404).send({'error': "clan not found"});

        } else res.status(422).send({'error':'Wrong tag formation'});
    } else res.status(422).send({'error':'empty parameters'})
}

/******************
 *     DELETE
******************/
const deleteClan = async (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    if(tag){
        tag = validators.validateTag(tag)
        if(tag){ // if regex is true
            try{
                const clan = await clanService.deleteClan(tag);
                if(clan) res.status(200).send({'data':clan});
                else res.status(404).send({'error':'not found'});
            } catch(err){
                console.log(err);
                res.status(500).send({'error':err});
            }
        } else res.status(422).send({'error':'Invalid tag format'});
    } else res.status(422).send({'error':'Empty tag'});
}

/******************
 *     PATCH
******************/
const editClan = async (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    const modifications = req.body;
    if(tag){
        tag = validators.validateTag(tag)
        if(tag){ // if regex is true
            if(modifications) {
                try {
                    console.log(modifications)
                    console.log(`-${tag}-`)
                    const clan = await clanService.editClan(tag, modifications);
                    if(clan) res.status(200).send({'data':clan});
                    else res.status(404).send({'error':'not found'});
                } catch(err){
                    console.log(err);
                    res.status(500).send({'error':err});
                }
            } else res.status(422).send({error:'Any modification was received'});
        } else res.status(422).send({'error':'Invalid tag format'});
    } else res.status(422).send({'error':'Empty tag'});

}

module.exports = { editClan, deleteClan, getClans, getClan, newClan, getClanPlayers }