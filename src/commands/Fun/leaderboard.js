const Levels = require('discord-xp');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Returns the xp leaderboard of the server!'),
    async execute(interaction) {
        const top = 10;
        let rawLeaderboard = await Levels.fetchLeaderboard(interaction.guild.id, top); // We grab top 10 users with most xp in the current server.
        if (rawLeaderboard.length < 1) return reply("Nobody's in the leaderboard yet.");
        else if (rawLeaderboard.length < top) rawLeaderboard = await Levels.fetchLeaderboard(interaction.guild.id, rawLeaderboard.length);
        const leaderboard = await Levels.computeLeaderboard(interaction.client, rawLeaderboard, true); // We process the leaderboard.
        const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`); // We map the outputs.

        await interaction.reply(`**Leaderboard**:\n\n${lb.join("\n\n")}`);
    },
};
