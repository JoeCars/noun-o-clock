const { MongoClient } = require('mongodb');
const dbUri = process.env.MONGODB_URI;

// MONGODB CONFIG
// db - "discord"
// collection - "guild_config"
// { 
//     "guild_id":guild_id,
//     "guild_name":guild_name,
//     "channel_id":channel_id,
//     "channel_name":channel_name
// }

async function setNounOClockMessage(guild_id, guild_name, message){

    console.log("calling setNounOClockMessage: " + guild_id + ", " + guild_name + ", "+message );

    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let result = null;

    try {

        await client.connect();
        const database = client.db("discord");
        const collection = database.collection("guild_config");
        const guild = await collection.findOne( { "guild_id": guild_id});

        if(!guild) {

            // Guild not set
            result = false;

        } else {

            await collection.updateOne(
                { "guild_id": guild_id}, // Filter
                { $set: {"message":message} },
                { upsert: true }
            )

            result = true;

        }

    } catch(err) {
        
        console.log(err);

    } finally {

        await client.close();

        return result;

    }
}

async function setGuildChannel(guild_id, guild_name, channel_id, channel_name) {

    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        await client.connect();
        const database = client.db("discord");
        const collection = database.collection("guild_config");
        const guild = await collection.findOne( { "guild_id": guild_id});

        const message = "Help choose the next Noun: **https://fomonouns.wtf/**";

        if(!guild) {

            await collection.insertOne({ 
                "guild_id":guild_id,
                "guild_name":guild_name,
                "channel_id":channel_id,
                "channel_name":channel_name,
                "message":message
            });

        } else {

            await collection.updateOne(
                { "guild_id": guild_id}, // Filter
                { $set: {"guild_name":guild_name, "channel_id": channel_id, "channel_name":channel_name} },
                { upsert: true }
            )

        }

    } catch(err) {
        
        console.log(err);

    } finally {

        await client.close();

    }

}

async function getGuildChannel(guild_id) {

    let channel_id = null;

    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        await client.connect();
        const database = client.db("discord");
        const collection = database.collection("guild_config");
        const guild = await collection.findOne( { "guild_id": guild_id});

        if(guild) {

            channel_id = guild.channel_id;          

        } 

    } catch(err) {

        console.log(err);

    } finally {

        await client.close();
        return channel_id;

    }

}

async function getAllGuilds() {

    let guilds = null;

    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        await client.connect();
        const database = client.db("discord");
        const collection = database.collection("guild_config");
        const res = await collection.find({}).toArray();

        if(res) {

            guilds = res;          

        } 

    } catch(err) {

        console.log(err);

    } finally {

        await client.close();
        return guilds;

    }

}

module.exports.setGuildChannel = async function(guild_id, guild_name, channel_id, channel_name){
    return await setGuildChannel(guild_id, guild_name, channel_id, channel_name);
}

module.exports.getGuildChannel = async function(guild_id){
    return await getGuildChannel(guild_id);
}

module.exports.getAllGuilds = async function(){
    return await getAllGuilds();
}

module.exports.setNounOClockMessage = async function(guild_id, guild_name, message){
    return await setNounOClockMessage(guild_id, guild_name, message);
}

module.exports.getNOCmessage = async function(guild_id){
    return await getNOCmessage(guild_id);
}

//TODO
// Set up a "create-database.js" js file that can be run to set up empty MongoDB cluster

// set up a CLEAR ALL COMMANDS function
// make clear difference between application and guild command usage

// these work in index.js

//UTILITY// MOVE
// Fetch all Application Commands
// client.application.commands.fetch()
//   .then(commands => console.log(`Fetched ${commands.size} commands`))
//   .catch(console.error);

// clear commands 
//   client.application.commands.set([]);