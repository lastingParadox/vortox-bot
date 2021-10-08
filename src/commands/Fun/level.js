const Levels = require('discord-xp');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Returns either your level or a user\'s level.')
        .addUserOption(option => option.setName('target').setDescription('The user\'s level to show.')),

    async execute(interaction) {
        const user = interaction.options.getUser('target');

        let target = await Levels.fetch(interaction.user.id, interaction.guild.id);

        if (user) {
            target = await Levels.fetch(user.id, interaction.guild.id);
            let mention = `<@${user.id}>`;
            if (!target) return interaction.reply({ content: `${user.username} does not have any levels within the server.`, ephemeral: true });

            try {
                await interaction.reply({content: `${mention} is social level ${target.level} and has ${target.xp}/${Levels.xpFor(target.level + 1)} social credits.`});
            } catch (error) {
                console.log(error);
            }
        }
        else {
            if (!target) return interaction.reply({ content: `You do not have any levels within the server.`, ephemeral: true });

            try {
                await interaction.reply({content: `<@${interaction.user.id}> is social level ${target.level} and has ${target.xp}/${Levels.xpFor(target.level + 1)} social credits.`});
            } catch (error) {
                console.log(error);
            }
        }
    },
};
