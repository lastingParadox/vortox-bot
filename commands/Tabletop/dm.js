const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require("../../utilities/enums");
const {VortoxEmbed} = require("../../utilities/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('DM actions.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('assert')
                .setDescription('Causes the specified event to occur.')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('The action to execute.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('grant')
                .setDescription('Grants a player with certain 8ball outcomes.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to grant to.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('The number of outcomes to grant.')
                        .setRequired(false) // Defaults to 1
                )
                .addBooleanOption(option =>
                    option.setName('result')
                        .setDescription('The result type to grant.')
                        .setRequired(false) // Defaults to TRUE
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // If user isn't a DM
        if (!interaction.member.roles.cache.some(role => role.name === 'DM')) {
            const embedFail = new VortoxEmbed(VortoxColor.ERROR, 'Error Using Command', `tried to use a DM command.`, interaction.member);
            embedFail.setDescription("You are not a DM!");
            await interaction.reply({embeds: [embedFail], ephemeral: true});
            return;
        }

        if (subcommand === "assert") {
            const action = interaction.options.getString('action');
            const embed = new EmbedBuilder()
                .setColor(VortoxColor.ASSERT)
                .setTitle('DM Action')
                .setDescription(action)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `The DM caused something to happen!`
                });

            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === "grant") {
            // TODO: Interaction with 8ball.js
            const embedFail = new VortoxEmbed(VortoxColor.ASSERT, 'Work in progress', `tried to grant an 8ball outcome.`, interaction.member);
            embedFail.setDescription("Sorry, this command is not yet finished!");
            await interaction.reply({embeds: [embedFail], ephemeral: true});
        }
    }
}