const MongoClient = require("mongodb").MongoClient
const uri = "mongodb+srv://stevemac228:3323gg6886sm01@cluster0.jv2wr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function connectToDB() {
    try {
        // Connect the client to the server
        await client.connect();
        let db = client.db('Survivor');
        console.log("Connected successfully to mongoDB");  
        return db;
    } catch (err) {
        throw err;
    } 
}

async function getDb() {
    return db;
}

async function closeDBConnection(){
    try{
        await client.close();    
    }catch(err){
        throw err;
    }    
};

module.exports = {connectToDB, getDb, closeDBConnection}