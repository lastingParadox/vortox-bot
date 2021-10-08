const Levels = require('discord-xp');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || message.channel.type === 'DM') return false;

        const userInDB = await Levels.fetch(message.author.id, message.guild.id);
        if (!userInDB) {
            Levels.createUser(message.author.id, message.guild.id);
            Levels.appendLevel(message.author.id, message.guild.id, 1);
        }

        const randomXP = Math.floor(Math.random() * 29) + 1;
        const hasLeveledUP = await Levels.appendXp(message.author.id, message.guild.id, randomXP);

        if(hasLeveledUP) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            message.channel.send(`<@${message.author.id}>, you have proceeded to level ${user.level}. Hot dog!`)
        }
    },
};