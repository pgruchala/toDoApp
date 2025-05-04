const session = require("express-session");
const Keycloak = require("keycloak-connect");
const express = require("express");
const app = express();
const cors = require("cors");
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(cors());
app.use(keycloak.middleware());


app.get('/protected',keycloak.protect(),(req,res)=>{
    res.status(200).json({message:"kamilślimak"})
    console.log("kamilślimak retrievved")
})

app.listen(3001,()=>{
    console.log('App listening on port 3001');
})