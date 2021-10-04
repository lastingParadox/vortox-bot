const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orb')
        .setDescription('Creates a squemorb.'),
    async execute(interaction) {
        const orb = interaction.emojis.cache.get("894675406307885078");
        return interaction.reply(`<${orb}>`);
    },
};