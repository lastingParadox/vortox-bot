const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DiceRoller, RollInitializeError } = require('vortox-dice-parser');
const { VortoxColor } = require('../../utilities/enums');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Calculates a dice roll using a provided expression.')
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('The dice expression to be rolled.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName("show-rolls")
                .setDescription("If true, shows the rolls that are calculated.")
                .setRequired(false)),

    async execute(interaction) {
        const expression = interaction.options.getString('expression');
        const showRolls = interaction.options.getBoolean('show-rolls');
        const embed = new EmbedBuilder()
            .setTitle(`Rolling ${expression}`);

        let roller;

        try {
            roller = new DiceRoller(expression);
        } catch (error) {
            if (error instanceof RollInitializeError) {
                embed.setColor(VortoxColor.ERROR)
                    .setDescription("Dice syntax is invalid!")
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to roll: ${expression}`});
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }

        embed.setColor(VortoxColor.DEFAULT)
            .setDescription(`You rolled a \`${roller.getTotal()}\`.`)
            .setFooter({
                iconURL: interaction.member.displayAvatarURL(),
                text: `${interaction.member.displayName} rolled: ${expression}`
            });

        if (showRolls === true)
            embed.addFields(
                { name: 'Rolls', value: `\`${roller.getRollString()}\`` },
            );

        await interaction.reply({ embeds: [embed] });
    }
}