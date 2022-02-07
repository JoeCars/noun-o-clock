const { MongoClient } = require('mongodb');
const dbUri = process.env.MONGODB_URI;


async function setGuildChannel(guild_id, channel_id) {

    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        await client.connect();
        const database = client.db("discord");
        const collection = database.collection("guild_config");
        const guild = await collection.findOne( { "guild_id": guild_id});

        if(!guild) {

            await collection.insertOne({ 
                "guild_id":guild_id,
                "channel_id":channel_id,
            });

        } else {

            await collection.updateOne(
                { "guild_id": guild_id}, // Filter
                { $set: {"channel_id": channel_id} },
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

    console.log("guild_id" + guild_id);
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

module.exports.setGuildChannel = async function(guild_id, channel_id){
    return await setGuildChannel(guild_id, channel_id);
}

module.exports.getGuildChannel = async function(guild_id){
    return await getGuildChannel(guild_id);
}

module.exports.getAllGuilds = async function(){
    return await getAllGuilds();
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