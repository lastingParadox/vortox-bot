const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const fetchAll = require('discord-fetch-all');
const fs = require('fs');

function msToTime(duration) {
    let milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('episode')
        .setDescription('test')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Starts a new episode.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Ends the current episode.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skips the current player\'s turn.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('turn')
                .setDescription('Displays who\'s turn it is.')),

    async execute(interaction) {

        await interaction.deferReply();

        if(interaction.member.voice.channelId === null) {
            await interaction.editReply("You are not connected to a voice channel!");
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#FF0000')
        const episodeList = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`));

        let thread = "";
        if (episodeList.episodeThread !== "") {
            thread = interaction.guild.channels.cache.get(episodeList.episodeThread);
        }

        if (interaction.options.getSubcommand() === "start") {

            if(thread !== "") {
                embed.setTitle('Unable to Start New Episode!')
                     .setDescription(`Episode ${episodeList.episodeCount} is currently in progress!`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            episodeList.episodeCount += 1;

            thread = await interaction.channel.threads.create({
                name: `Final Frontier 4 Episode ${episodeList.episodeCount}`,
                autoArchiveDuration: 60,
                reason: `Final Frontier 4 Episode ${episodeList.episodeCount}`,
            });

            episodeList.users = [];

            interaction.member.voice.channel.members.each(member=>{
                let temp = {id: member.id, name: member.displayName, turn: false};
                episodeList.users.push(temp);
                thread.members.add(member.id);
            });

            episodeList.users.sort(function(a, b) {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });

            let dmList = await interaction.guild.roles.fetch("977241924505313310").then(role => {
                let array = [];
                role.members.forEach(member => {
                    if (member.bot) return;
                    array.push(member.id);
                })
                return array;
            });

            episodeList.users.push({id: "DM", ids: dmList, turn: false});
            episodeList.users[0]["turn"] = true;

            interaction.client.user.setActivity("Final Frontier", {type: 'PLAYING'});

            episodeList.episodeThread = thread.id;
            embed.setTitle(`Starting New Episode`)
                 .setDescription(`Started new [episode](https://discord.com/channels/${interaction.guild.id}/${thread.id})!`);
        }

        else if (interaction.options.getSubcommand() === "skip") {

            const user = episodeList.users.find(x => x.turn === true);
            const newUser = episodeList['users'][(episodeList.users.findIndex(element => element === user) + 1) % episodeList.users.length]
            user.turn = false;

            newUser.turn = true;

            embed.setTitle("Skipping Turn")

            if (user.id === "DM")
                embed.setDescription(`Skipped The DM's turn.\nIt is now `);
            else
                embed.setDescription(`Skipped <@${user.id}>'s turn.`);
        }

        else if (interaction.options.getSubcommand() === "stop") {

            if(thread === "") {
                embed.setTitle('Unable to Stop Episode!')
                     .setDescription(`There is no episode currently in progress!`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const allMessages = await fetchAll.messages(thread);

            thread.send("Ending episode!");

            episodeList.episodeThread = "";
            episodeList.users = [];
            episodeList.episodes.push({ name: thread.name, messageCount: allMessages.length, episodeLength: msToTime(Date.now() - thread.createdAt) });

            interaction.client.user.setActivity("Space Rulebook", {type: 'WATCHING'});

            embed.setTitle(`Stopping Episode`)
                .setDescription(`Ended Episode ${thread.name}`);
        }

        else if (interaction.options.getSubcommand() === "turn") {
            const user = episodeList.users.find(x => x.turn === true);

            if (user.id !== "DM") {
                embed.setTitle("Episode Turn")
                    .setDescription(`It's <@${user.id}>'s turn to 8ball!`);
            }
            else {
                embed.setTitle("Episode Turn")
                    .setDescription(`It's The DM's turn to 8ball!`);
            }
        }

        fs.writeFile(process.cwd() + `\\items\\episodes.json`, JSON.stringify(episodeList, null, 2), async err => {
            if (err) {
                console.log(`Error writing to episodes.json.`, err);
                embed.setTitle(`Writing to Episode Failed!`);
                embed.setDescription(`Failed to edit an episode! (Check the console.)`);
            }
        });

        embed.setColor('#FFA500');

        await interaction.editReply( {embeds: [embed] })

        if (interaction.options.getSubcommand() === "stop") await thread.setArchived(true);
    },
};
