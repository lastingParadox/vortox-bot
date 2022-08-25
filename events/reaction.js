module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return false;

        if (message.content.toLowerCase().includes("orb")) {
            message.react(`🟠`).then();
        }

        if (message.content.toLowerCase().includes("squoat")) {
            message.react(`🦀`).then();
        }
    },
};
