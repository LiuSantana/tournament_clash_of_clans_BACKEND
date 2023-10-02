const express = require("express"); 
const https = require('https');
const fs = require('fs');
const cors = require('cors');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/mirrorcup.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/mirrorcup.org/cert.pem')
};

const app = express(); 

const PORT = process.env.PORT || 3000; 

const v1Router = require("./v0.1/routes");
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Configura CORS antes de configurar las rutas
app.use(cors({origin: '*'}));

app.use("/api/v0.1", v1Router);
app.use(express.json());

const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
}); 
server.on('error', error => {
  console.error('Error starting HTTPS server:', error);
});
