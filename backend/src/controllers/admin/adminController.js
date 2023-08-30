const adminService = require('../../services/admin/adminService');

const registrationState = async (req, res) => {
    try {
        const state = await adminService.registrationState();
        if(state) res.status(200).send({data:'OK'});
        else res.status(404).send({error:'Something went wrong'});
    } catch (err) {
        res.status(500).send({error:'Internal server error'})
    }
}

module.exports = { registrationState };