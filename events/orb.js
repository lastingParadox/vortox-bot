module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return false;

        if (message.content.toLowerCase().includes("orb")) {
            const orb = message.client.emojis.cache.find(emoji => emoji.name === "squorbet");
            message.react(`${orb}`);
        }

        console.log(`Message from ${message.author.username}: ${message.content}`);
    },
};