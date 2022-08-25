const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');
const { EpisodeUtils } = require("../../utilities/episodeUtils");
const {episodeSchema} = require("../../models/episodes");
const mongoose = require("mongoose");
const {VortoxEmbed} = require("../../utilities/embeds");

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

    if (nameA === "dm")
        return 1;
    else if (nameB === "dm")
        return -1;

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
            subcommand.setName('leave')
                .setDescription('Removes you from an ongoing episode.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('pause')
                .setDescription('Removes you from an ongoing episode.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('Stops the current episode.')
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder();
        const Episode = mongoose.model("Episodes", episodeSchema)

        if ((subcommand === 'stop' || subcommand === 'join' || subcommand === 'leave') && !EpisodeUtils.isCurrentEpisode()) {
            embed.setColor(VortoxColor.ERROR)
                .setTitle("Unable to Stop Episode!")
                .setDescription(`There is no episode currently in progress!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} tried to do something that's not possible.`
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === "start") {
            if (EpisodeUtils.isCurrentEpisode()) {
                const thread = interaction.guild.channels.cache.get(currentEpisode.episodeThread);
                embed.setColor(VortoxColor.ERROR)
                    .setTitle("Unable to Start New Episode!")
                    .setDescription(`Episode ${thread.name} is currently in progress!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to start an episode.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const sideEpisode = interaction.options.getBoolean("side_episode");
            const numEpisodes = await Episode.countDocuments();

            let episodeName;
            if (sideEpisode) episodeName = interaction.guild.name + " Side Episode " + numEpisodes + 1;
            else episodeName = interaction.guild.name + " Episode " + numEpisodes + 1;

            const newThread = await interaction.channel.threads.create({
                name: episodeName,
                autoArchiveDuration: 60,
                reason: episodeName
            });

            const users = [];

            if (interaction.member.voice.channelId !== null) {
                interaction.member.voice.channel.members.each(async member => {
                    let temp = { id: member.id, name: member.displayName, messageCount: 0, hasLeft: false, turn: false };
                    users.push(temp);
                    await newThread.members.add(member.id);
                });
            }
            else {
                users.push({ id: interaction.member.id, name: interaction.member.displayName, messageCount: 0, hasLeft: false, turn: false});
                await newThread.members.add(interaction.member.id);
            }

            let dmRole = await interaction.guild.roles.cache.find(role => role.name === "DM");

            users.push(({ id: "DM", role: dmRole.id, name: "DM", turn: false }));

            users.sort(sortEpisodeUsers);

            users[0].turn = true;

            const newEpisode = new Episode({
                id: numEpisodes + 1,
                name: episodeName,
                description: "An episode without a curated description.",
                threadId: newThread.id,
                current: true,
                players: users,
                turnCount: 1,
                messageCount: 0,
                episodeLength: "",
                guildId: interaction.guildId
            })

            try {
                await newEpisode.save();
                console.log(`Added episode ${newEpisode.id} to the database.`);
            } catch (err) {
                console.log(`Id matching ${newEpisode.id} already exists in the ${interaction.guildId} database, not adding new document.`);
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding Episode \`${newEpisode.id}\``, `tried to add episode ${newEpisode.id} to the database.`, interaction.member);
                failEmbed.setDescription(`Episode id \`${newEpisode.id}\` in this guild already exists!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            embed.setColor(VortoxColor.DEFAULT)
                .setTitle(`Starting New Episode`)
                .setDescription(`Started new [episode](https://discord.com/channels/${interaction.guild.id}/${newThread.id})!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} started an episode.`
                });

            await interaction.reply({ embeds: [embed] })
        }
        else if (subcommand === "join") {

        }
    }
}