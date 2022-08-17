module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return false;

        if (message.content.toLowerCase().includes("orb")) {
            const orb = message.client.emojis.cache.find(emoji => emoji.name === "squorbet");
            message.react(`${orb}`).then();
        }

        if (message.content.toLowerCase().includes("squoat")) {
            message.react(`🦀`).then();
        }
    },
};