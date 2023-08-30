const adminDatabase = require('../../database/admin/adminDatabase');

const registrationState = async () => {
    return await adminDatabase.registrationState();
}

module.exports = { registrationState };