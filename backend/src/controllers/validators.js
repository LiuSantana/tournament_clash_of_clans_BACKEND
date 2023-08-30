const axios = require('axios');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM2ZjcwMjE2LWQxNDktNDNjMi1hNTlmLTg2OWM3MjY0OWQ4YSIsImlhdCI6MTY2ODE1NTE1Miwic3ViIjoiZGV2ZWxvcGVyLzBlN2JhOTU1LTk5MzQtNjg3NS1hNWI1LWYxY2Y0MDMyNTIzYSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE1My45Mi4yMTEuMTc2Il0sInR5cGUiOiJjbGllbnQifV19.CmS5DNKzxgmmc24eaJDuU9O88_ZWCi_qL2rGvahapIcXhXeiu52u1Pvy471_IBnr3mcgyuJH5TuU3A7AHC4Kdw';


const validateTag = (tag) => {
    let validated = false;
    tag = tag.toLocaleUpperCase();
    const regex = /^#?[a-zA-Z0-9]{1,14}$/; // optional # and max 14 alpha-numeric
    tag = tag.replace(/o/gi, "0"); // remplace o/O for 0
    if(regex.test(tag)){
        if(tag.charAt(0) != '#') validated = `#${tag}`;
        else validated = tag;
    }
    return validated
}


// validate with clash API
const validClan = async (tag) => {
    const apiUrl = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(tag)}`;
    let clan = false;
    await axios.get(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        if(response.status == 200) clan = true;
    })
    .catch(error => {
        console.error('Error al hacer la solicitud:', error.message);
    });

    return clan
}

const getPlayer = async (tag) => {
    const apiUrl = `https://api.clashofclans.com/v1/players/${encodeURIComponent(tag)}`;
    let player = false;
    await axios.get(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        if(response.status == 200) {
            player = { tag: response.data.tag, name: response.data.name }; 
        }
    })
    .catch(error => {
        console.error('Error al hacer la solicitud:', error.message);
    });

    return player;
}

module.exports = { validateTag, validClan, getPlayer };