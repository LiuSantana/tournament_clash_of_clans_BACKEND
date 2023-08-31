const jwt = require('jsonwebtoken');
const clanService = require('../../services/clan/clanService');
const validators = require('../validators');
const crypto = require('crypto');

const secretKey = 'token-generator-secret';

const generateToken = (userData) => {
  const token = jwt.sign(userData, secretKey);
  return token;
}

function hashStringLimited(inputString, limit) {
    if (inputString.length > limit) {
        inputString = inputString.substr(0, limit);
    }

    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}
function compareHashedPasswords(inputPassword, hashedPassword) {
    const hashedInputPassword = hashStringLimited(inputPassword, 500);
    return hashedInputPassword === hashedPassword;
}

const login = async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;

    if(user && password) {
        let clan = await clanService.loginClan(user);
        if(clan){
            if(compareHashedPasswords(password, clan.password)){
                let token = generateToken({tag:clan.tag, clan:clan.name});
                res.status(200).send({token});
            } else res.status(401).send({error:'password mismatch'});
        } else res.status(404).send({error:'clan not found'});
    } else res.status(422).send({error:'Empty params'});
}

const verifyPrivileges = async (req, res) => {
    let token = req.body.token;
    let clan = req.body.clan;
    if(token && clan) {
        clan = validators.validateTag(clan);
        if(clan){
            try{
                const decodedToken = jwt.verify(token, secretKey);
                if(clan == decodedToken.tag || decodedToken.tag == '#0000') res.status(200).send({data:'OK'}); 
                else res.status(401).send({error:'You dont have privileges'})
            } catch(err){
                res.status(500).send({error:'Invalid token'});
            }
        } else res.status(422).send({error:'Clan tag is not valid'})
    } else res.status(422).send({error:'Empty params'})
}


const renewToken = async (req, res) => {
    const token = req.body.token;
    if(token){
        try{
            const decodedToken = jwt.verify(token, secretKey)
            if(decodedToken.tag) {
                const newToken = generateToken({tag:decodedToken.tag, clan:decodedToken.name});
                if(newToken) res.status(200).send({token:newToken});
                else res.status(500).send({error:'Internal server error'});
            } else res.status(401).send({error:'Token not valid'});
        } catch(err){
            res.status(500).send({error:'Internal server error'});
        }
    } else res.status(422).send({error:'token not found'});
}

const anonymousToken = async (req, res) => {
    try {
        const newToken = generateToken({tag:'anonymous', clan:'anonymous'});
        if(newToken) res.status(200).send({token:newToken});
        else res.status(500).send({error:'Internal server error'});
    } catch(err){
            res.status(500).send({error:'Internal server error'});
    }
}

module.exports = { anonymousToken, login, renewToken, verifyPrivileges};