const express = require('express');
const router = express.Router();

/**********************
 *       SESSION
**********************/
const loginController = require("../../controllers/login/loginController");

router.get('/anonymousToken', loginController.anonymousToken);

router.post('/login', loginController.login);
router.post('/verifyPrivileges', loginController.verifyPrivileges);
router.post('/renewToken', loginController.renewToken);


/**********************
 *       ADMIN
**********************/
const adminController = require("../../controllers/admin/adminController");

router.get('/registrationState', adminController.registrationState);


/**********************
 *       CLAN
**********************/
const clanController = require("../../controllers/clan/clanController");

router.get('/clans', clanController.getClans);
router.get('/clans/:tag', clanController.getClan);
router.get('/clans/:tag/players', clanController.getClanPlayers);

router.post('/clans', clanController.newClan);

router.delete('/clans/:tag', clanController.deleteClan);

router.patch('/clans/:tag', clanController.editClan);

// TODO: DELETE CLAN

/**********************
 *      PLAYER
**********************/
const playerController = require("../../controllers/player/playerController");

router.get('/players/:tag', playerController.getPlayer);
router.get('/players/:tag/validate', playerController.validatePlayer);
router.post('/players/', playerController.newPlayer);
router.delete('/players/:tag', playerController.removePlayer);

/**********************
 *        WAR
**********************/
// maybe a tournament table is needed to manage all the wars easily
const warController = require("../../controllers/war/warController");

router.get('/wars', warController.getWars);
router.get('/wars/:id/attacks', warController.getWarAttacks);
router.get('/wars/ranking', warController.getRanking);
router.get('/wars/:id/results', warController.getWarEnded);

router.post('/wars', warController.createTournament);
router.post('/wars/:id', warController.endWar);
// TODO: NEW WAR SANCTION

// TODO: DELETE WAR SANCTION

/**********************
 *      ATTACKS
**********************/
const attackController = require("../../controllers/attack/attackController");
router.get('/attacks', attackController.getAttacks);
// TODO: EDIT ATTACK


module.exports = router;