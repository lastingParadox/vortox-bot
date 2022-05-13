const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
                .setName('turn')
                .setDescription('Displays who\'s turn it is.')),

    async execute(interaction) {

        if(interaction.member.voice.channelId === null) {
            await interaction.reply("You are not connected to a voice channel!");
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
                await interaction.reply({ embeds: [embed] });
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
                let temp = {id: member.id, name: member.user.tag, turn: false};
                episodeList.users.push(temp);
                thread.members.add(member.id);
            })

            episodeList.users.sort(function(a, b) {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            })
            episodeList.users[0]["turn"] = true;

            interaction.client.user.setActivity("Final Frontier", {type: 'PLAYING'});

            episodeList.episodeThread = thread.id;
            embed.setTitle(`Starting New Episode`)
                 .setDescription(`Started new [episode](https://discord.com/channels/${interaction.guild.id}/${thread.id})!`);
        }

        else if (interaction.options.getSubcommand() === "stop") {

            if(thread === "") {
                embed.setTitle('Unable to Stop Episode!')
                     .setDescription(`There is no episode currently in progress!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            thread.send("Ending episode!");

            episodeList.episodeThread = "";
            episodeList.users = [];
            episodeList.episodes.push({ name: thread.name, messageCount: thread.messages.cache.size, episodeLength: msToTime(thread.lastMessage.createdAt - thread.createdAt) });

            interaction.client.user.setActivity("Space Rulebook", {type: 'WATCHING'});

            embed.setTitle(`Stopping Episode`)
                .setDescription(`Ended Episode ${thread.name}`);
        }

        else if (interaction.options.getSubcommand() === "turn") {
            const user = episodeList.users.find(x => x.turn === true);

            embed.setTitle("Episode Turn")
                 .setDescription(`It's <@${user.id}>'s turn to 8ball!`);
        }

        fs.writeFile(process.cwd() + `\\items\\episodes.json`, JSON.stringify(episodeList, null, 2), err => {
            if (err) {
                console.log(`Error writing to episodes.json.`, err);
                embed.setTitle(`Writing to Episode Failed!`);
                embed.setDescription(`Failed to edit an episode! (Check the console.)`);
                interaction.reply({ embeds: [embed] });
                return;
            }
            else {
                console.log(`Episode Started!`);
            }
        });

        embed.setColor('#FFA500');

        await interaction.reply( {embeds: [embed] })

        if (interaction.options.getSubcommand() === "stop") await thread.setArchived(true);
    },
};
