module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return true;
        if (!message.author.bot) return false;
        
        if (message.embeds[0].description.toLowerCase().includes("majority rules! vote on it!")) {
            //const yes = message.client.emojis.cache.find(emoji => emoji.name === "U0001F44D");
            message.react("👍");
            //const no = message.client.emojis.cache.find(emoji => emoji.name === "U0001F44D");
            message.react("👎");
        }

        console.log(message.embeds[0]);
        console.log(message.embeds[0].description);
        if (message.embeds.length > 0) {
            console.log("Logger isn't broken");
        }
    },
};