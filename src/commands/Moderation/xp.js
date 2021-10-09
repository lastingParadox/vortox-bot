const Levels = require('discord-xp');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { levelnames, pointnames } = require('../../points.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Subtracts xp from a user. ADMINISTRATORS ONLY.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('show')
                .setDescription('Shows a user\'s xp and level.')
                .addUserOption(option => option.setName('target').setDescription('The user to deduct points from.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Gives a user xp. ADMINISTRATORS ONLY.')
                .addUserOption(option => option.setName('target').setDescription('The user to deduct points from.').setRequired(true))
                .addIntegerOption(option => option.setName('xp').setDescription('The amount of points to subtract.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('subtract')
                .setDescription('Subtracts xp from a user. ADMINISTRATORS ONLY.')
                .addUserOption(option => option.setName('target').setDescription('The user to deduct points from.').setRequired(true))
                .addIntegerOption(option => option.setName('xp').setDescription('The amount of points to subtract.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Sets a user\'s xp. ADMINISTRATORS ONLY.')
                .addUserOption(option => option.setName('target').setDescription('The user to deduct points from.').setRequired(true))
                .addIntegerOption(option => option.setName('xp').setDescription('The amount of points to subtract.').setRequired(true))),
                
    async execute(interaction) {
        const rand = Math.floor(Math.random() * levelnames.length);

        if (interaction.options.getSubcommand() === 'show') {
            const user = interaction.options.getUser('target');
            if (user) {
                const target = await Levels.fetch(user.id, interaction.guild.id);
                return await interaction.reply({ content: `<@${user.id}> is ${levelnames[rand]} ${target.level} and has ${target.xp}/${Levels.xpFor(target.level + 1)} ${pointnames[rand]}.` });
            }
            else {
                const target = await Levels.fetch(interaction.user.id, interaction.guild.id);
                return await interaction.reply({ content: `<@${interaction.user.id}> is ${levelnames[rand]} ${target.level} and has ${target.xp}/${Levels.xpFor(target.level + 1)} ${pointnames[rand]}.` });
            }
        }

        else if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
            return await interaction.reply({ content: 'You do not have access to this command.', ephemeral: true });
        
            const user = interaction.options.getUser('target');
            const amount = interaction.options.getInteger('xp');
            const target = await Levels.fetch(user.id, interaction.guild.id);

        if (interaction.options.getSubcommand() === 'add') {
            Levels.appendXp(user.id, interaction.guild.id, amount);
            return await interaction.reply({ content: `Added ${amount} ${pointnames[rand]} to <@${user.id}>.\n<@${user.id}> now has ${target.xp + amount} ${pointnames[rand]}.`});
        }
        else if (interaction.options.getSubcommand() === 'subtract') {
            Levels.subtractXp(user.id, interaction.guild.id, amount);
            return await interaction.reply({ content: `<@${user.id}>'s ${pointnames[rand]} was reduced by ${amount}.\n<@${user.id}> now has ${target.xp - amount} ${pointnames[rand]}.`});
        }
        else if (interaction.options.getSubcommand() === 'set') {
            Levels.setXp(user.id, interaction.guild.id, amount);
            return await interaction.reply({ content: `<@${user.id}> now has ${amount} ${pointnames[rand]}.`});
        }
        else {
            return await interaction.reply({content: 'No subcommand was found.', ephemeral: true});
        }
    },
};
