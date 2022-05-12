const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Quote a character!')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The character to be quoted.')
                .setRequired(false)),

    async execute(interaction) {
        let id = interaction.options.getString('id');

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`\`${id}\` Quote`);

        let charList = JSON.parse( fs.readFileSync(process.cwd() + `\\items\\characters.json`) );

        while(id === null) {
            let rand = Math.floor(Math.random() * charList.length);
            if (charList[rand]['quotes']['ff2'].length !== 0 || charList[rand]['quotes']['ff3'].length !== 0 || charList[rand]['quotes']['ff4'].length !== 0 || charList[rand]['quotes']['other'].length !== 0)
                id = charList[rand]['id'];
        }

        id = id.toLowerCase();

        const character = charList.find(e => e.id === id);

        if (character === undefined) {
            embed.setDescription(`Character id \`${id}\` not found!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const quotes = character.quotes;

        let quoteList = [];
        quoteList = quoteList.concat(quotes.ff2).concat(quotes.ff3).concat(quotes.ff4).concat(quotes.other);

        if(quoteList.length === 0) {
            embed.setDescription(`${character.name} has no quotes!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const choice = Math.floor(Math.random() * quoteList.length);

        if (choice < (quotes.ff2.length) && (quotes.ff2.length !== 0))
            embed.setFooter({ text: `${character.name} said this during FF2.` });
        else if (choice >= (quotes.ff2.length) && choice <= (quotes.ff2.length + quotes.ff3.length) && quotes.ff3.length !== 0)
            embed.setFooter({ text: `${character.name} said this during FF3.` });
        else if (choice >= (quotes.ff2.length + quotes.ff3.length) && choice <= (quoteList.length - quotes.other.length) && quotes.ff4.length !== 0)
            embed.setFooter({ text: `${character.name} said this during FF4.` });
        else
            embed.setFooter({ text: `${character.name} said this during some adventure.` });

        embed.setDescription(`"${quoteList[choice]}"`)
             .setTitle("")
             .setAuthor({ name: `${character.name} Says...`, iconURL: character.image })
             .setColor(character.color);

        await interaction.reply({ embeds: [embed] });
    },
};