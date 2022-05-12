const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Search the wiki!')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The search term.')
                .setRequired(true)),

    async execute(interaction) {

        const query = interaction.options.getString('query');

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Searching for \`${query}\``)
            .setFooter({ text: `${interaction.member.displayName} requested to search the wiki for: "${query}"`})

        let url = `https://vortox.fandom.com/api.php?action=query&list=search&srsearch=` + query + `&format=json`;
        let response;

        try {
            response = await fetch(url).then(res => res.json());

            embed.setTitle(response.query.search[0].title)
                 .setURL('https://vortox.fandom.com/wiki/' + response.query.search[0].title.replaceAll(" ", "_"))

            const id = response.query.search[0].pageid;

            url = `https://vortox.fandom.com/api.php?format=json&action=query&explaintext=1&titles=${response.query.search[0].title.replaceAll(" ","_")}`
            let option = '&prop=extracts'

            response = await fetch(url + option).then(res => res.json());

            let description = response['query']['pages'][id]['extract'];
            description = description.split("\n");

            embed.setDescription(description[0]);
            option = '&prop=images'

            response = await fetch(url + option).then(res => res.json());

            description = response['query']['pages'][id]['images'].filter(x => x.title.endsWith('.png') | x.title.endsWith('.jpg'));
            description = description[0]['title'];

            description = description.split(':')[1].replaceAll(" ", "_");
            console.log(description);

            url = 'https://vortox.fandom.com/wiki/Special:FilePath/' + description;

            embed.setThumbnail(url)
                 .setColor('#FFA500')
        }
        catch (e) {
            embed.setDescription(`Sorry, couldn\'t find any pages including ${query}.`)
        }
        await interaction.reply({ embeds: [embed] });
    },
};
