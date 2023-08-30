const express = require("express"); 
const app = express(); 
const cors = require('cors');
app.use(cors({}));
app.use(express.json());

const PORT = process.env.PORT || 3000; 


const v1Router = require("./v0.1/routes");
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use("/api/v0.1", v1Router);

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
}); 

