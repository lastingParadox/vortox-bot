const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets the hp of the specified character.')
        .addStringOption(option => {
            option.setName('id')
                .setDescription('The id of the character to be reset. (Or \'all\')')
                .setRequired(true)
            //let choices;
            //let readChars = fs.readFileSync(process.cwd() + `\\items\\characters.json`);
            //choices = JSON.parse(readChars);

            //for (let type of choices) {
            //    option.addChoice(type.id, type.id);
            //}
            //option.addChoice('all', 'all');
            return option;
        }),
    category: "Tabletop",

    async execute(interaction) {
        const id = interaction.options.getString('id');

        const charlist = JSON.parse( fs.readFileSync(process.cwd() + `\\items\\characters.json`) );

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Resetting`);

        if (id !== 'all') {
            const character = charlist.find(e => e.id === id);

            if (character === undefined) {
                embed.setDescription(`Character id \`${id}\` not found!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            character.hp = character.maxhp;
            embed.setDescription(`\`${character.name}\` was successfully reset!`)
        }
        else {
            for (let character of charlist) {
                character.hp = character.maxhp;
            }
            embed.setDescription('All characters were successfully reset!');
        }

        embed.setColor('#FFA500');

        fs.writeFile(process.cwd() + `\\items\\characters.json`, JSON.stringify(charlist, null, 2), async err => {
            if (err) {
                console.log('Error writing to character.json.', err);
                embed.setTitle(`Resetting Failed!`);
                embed.setDescription(`Failed to edit \`${id}!\` (Check the console.)`);
            } else {
                console.log("characters.json successfully written to!");
            }
        });

        await interaction.reply({ embeds: [embed] });
    },
};