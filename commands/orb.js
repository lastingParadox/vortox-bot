const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orb')
        .setDescription('Creates a squemorb.'),
    async execute(interaction) {
        const orb = interaction.client.emojis.cache.find(emoji => emoji.name === "squorbet");
        return interaction.reply(`${orb}`);
    },
};