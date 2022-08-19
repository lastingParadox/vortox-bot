const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');
const { EpisodeUtils } = require("../../utilities/episodeUtils");

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

function sortEpisodeUsers(a, b) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('episode')
        .setDescription('Accesses episode content.')
        .addSubcommand(subcommand =>
            subcommand.setName('start')
                .setDescription('Starts an episode.')
                .addBooleanOption(option =>
                option.setName("side_episode")
                    .setDescription("If true, makes the episode a side episode.")
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('join')
                .setDescription('Adds you to an ongoing episode.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('Stops the current episode.')
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder();

        const episodes = EpisodeUtils.episodeArray;
        const currentEpisode = episodes.currentEpisode;

        if ((subcommand === 'stop' || subcommand === 'join') && !EpisodeUtils.isCurrentEpisode()) {
            embed.setColor(VortoxColor.ERROR)
                .setTitle("Unable to Stop Episode!")
                .setDescription(`There is no episode currently in progress!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} tried to stop an episode.`
                });
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === 'start') {
            if (EpisodeUtils.isCurrentEpisode()) {
                const thread = interaction.guild.channels.cache.get(currentEpisode.episodeThread);
                embed.setColor(VortoxColor.ERROR)
                    .setTitle("Unable to Start New Episode!")
                    .setDescription(`Episode ${thread.name} is currently in progress!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to start an episode.`
                    });
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }

            const isSideEpisode = interaction.options.getBoolean("side_episode");

            let newThread;

            if (episodes.campaignName === "")
                episodes.campaignName = interaction.guild.name;

            let episodeName;

            if (isSideEpisode) {
                episodes.sideEpisodeCount += 1;
                episodeName = `${episodes.campaignName} Side Episode ${episodes.sideEpisodeCount}`;
            }
            else {
                episodes.mainEpisodeCount += 1;
                episodeName = `${episodes.campaignName} Episode ${episodes.mainEpisodeCount}`;
            }

            newThread = await interaction.channel.threads.create({
                name: episodeName,
                autoArchiveDuration: 60,
                reason: episodeName
            });

            currentEpisode.episodeThread = newThread.id;

            const users = [];

            if (interaction.member.voice.channelId !== null) {
                interaction.member.voice.channel.members.each(async member => {
                    let temp = {id: member.id, name: member.displayName, messageCount: 0, turn: false};
                    users.push(temp);
                    await newThread.members.add(member.id);
                });
            }
            else {
                users.push({id: interaction.member.id, name: interaction.member.displayName, messageCount: 0, turn: false});
                await newThread.members.add(interaction.member.id);
            }

            users.sort(sortEpisodeUsers);

            users[0].turn = true;

            currentEpisode.episodeUsers = users;
            currentEpisode.episodeName = episodeName;

            EpisodeUtils.saveNew(episodes);

            embed.setColor(VortoxColor.DEFAULT)
                .setTitle(`Starting New Episode`)
                .setDescription(`Started new [episode](https://discord.com/channels/${interaction.guild.id}/${newThread.id})!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} started an episode.`
                });
        }
        else if (subcommand === 'stop') {

            const thread = interaction.guild.channels.cache.get(currentEpisode.episodeThread);
            thread.send("Ending episode!");

            currentEpisode.episodeName = thread.name;
            currentEpisode.episodeLength = msToTime(Date.now() - thread.createdAt);

            const past = episodes.pastEpisodes;
            past.push(currentEpisode);

            episodes.currentEpisode = {
                "episodeThread": "",
                "episodeName": "",
                "episodeUsers": [],
                "messageCount": 0,
                "episodeLength": "N/A"
            };

            EpisodeUtils.saveNew(episodes);

            embed.setColor(VortoxColor.DEFAULT)
                .setTitle(`Stopping Episode`)
                .setDescription(`Ended Episode \`${thread.name}\``)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} stopped an episode.`
                });

            await interaction.editReply({ embeds: [embed] });
            await thread.setArchived(true);
            return;
        }
        else if (subcommand === 'join') {
            const thread = interaction.guild.channels.cache.get(currentEpisode.episodeThread);

            let exist = false;

            for (let user of currentEpisode.episodeUsers) {
                if (user.id === interaction.member.id) {
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                currentEpisode.episodeUsers.push({id: interaction.member.id, name: interaction.member.displayName, messageCount: 0, turn: false});
                currentEpisode.episodeUsers.sort(sortEpisodeUsers);
            }

            await thread.members.add(interaction.member.id);

            EpisodeUtils.saveNew(episodes);
        }

        await interaction.editReply({ embeds: [embed] });
    },
};