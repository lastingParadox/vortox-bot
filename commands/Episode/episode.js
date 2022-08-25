const { SlashCommandBuilder } = require('@discordjs/builders');
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
                .setDescription('Pauses the current episode.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('unpause')
                .setDescription('Unpauses the current episode.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('Stops the current episode.')
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const Episode = mongoose.model("Episodes", episodeSchema)
        const currentEpisode = EpisodeUtils.currentEpisode;

        if ((subcommand === 'stop' || subcommand === 'join' || subcommand === 'leave' || subcommand === "pause" || subcommand === "unpause") && currentEpisode === null) {
            const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Unable to Access Episode!", `tried to access the current episode.`, interaction.member);
            failEmbed.setDescription(`There is no episode currently in progress!`);
            await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            return;
        }

        if (subcommand === "start") {
            if (currentEpisode !== null) {
                const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Starting New Episode`, `tried to start a new episode.`, interaction.member);
                failEmbed.setDescription(`Cannot start an episode as ${thread.name} is ongoing!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const sideEpisode = interaction.options.getBoolean("side_episode");
            const numEpisodes = await Episode.countDocuments();

            let episodeName;
            if (sideEpisode) episodeName = interaction.guild.name + " Side Episode " + (numEpisodes + 1);
            else episodeName = interaction.guild.name + " Episode " + (numEpisodes + 1);

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

            users.push(({ id: "DM", name: "DM", role: dmRole.id, turn: false }));

            users.sort(sortEpisodeUsers);

            users[0].turn = true;

            const newEpisode = new Episode({
                id: "episode" + (numEpisodes + 1),
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
                EpisodeUtils.currentEpisode = newEpisode;
                console.log(`Added episode ${newEpisode.id} to the database.`);
            } catch (err) {
                console.log(`Id matching ${newEpisode.id} already exists in the ${interaction.guildId} database, not adding new document.`);
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Adding Episode \`${newEpisode.id}\``, `tried to add episode ${newEpisode.id} to the database.`, interaction.member);
                failEmbed.setDescription(`Episode id \`${newEpisode.id}\` in this guild already exists!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const successEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `Starting New Episode`, `started an episode.`, interaction.member)
            successEmbed.setDescription(`Started new [episode](https://discord.com/channels/${interaction.guild.id}/${newThread.id})!`);

            await interaction.reply({ embeds: [successEmbed] })
        }
        else if (subcommand === "join") {
            const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);

            if (thread.guildMembers.get(interaction.member.id) !== undefined) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Joining Current Episode`, `tried to join the current episode.`, interaction.member);
                failEmbed.setDescription(`You're already in this episode!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let exist = false;

            const player = currentEpisode.players.find(aPlayer => aPlayer.id === interaction.member.id);
            if (player) exist = true;

            if (!exist) {
                currentEpisode.players.push({id: interaction.member.id, name: interaction.member.displayName, messageCount: 0, hasLeft: false, turn: false});
                currentEpisode.players.sort(sortEpisodeUsers);
            } else player.hasLeft = false;

            await thread.members.add(interaction.member.id);

            await currentEpisode.save();

            const successEmbed = new VortoxEmbed(VortoxColor.SUCCESS, `Joining Current Episode`, `joined the current episode.`, interaction.member)
            successEmbed.setDescription(`Added you to Episode \`${thread.name}\`!`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        }
        else if (subcommand === "leave") {
            const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);
            let exist = true;

            const player = currentEpisode.players.find(aPlayer => aPlayer.id === interaction.member.id);
            if (!player) exist = false;
            else {
                player.hasLeft = true;
                if (player.turn === true) {
                    let index = currentEpisode.players.indexOf(player);
                    for (let i = 1; i < currentEpisode.players.length; i++) {
                        let newPlayer = currentEpisode.players[(index + i) % currentEpisode.players.length];
                        if (!newPlayer.hasLeft) {
                            newPlayer.turn = true;
                            player.turn = false;
                            break;
                        }
                    }
                }
            }

            if (!exist) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, `Error Leaving Current Episode`, `tried to leave the current episode.`, interaction.member);
                failEmbed.setDescription(`You are not part of the current episode!`);
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
            else {
                await thread.members.remove(interaction.member.id);

                await currentEpisode.save();

                const successEmbed = new VortoxEmbed(VortoxColor.SUCCESS, `Leaving Current Episode`, `left the current episode.`, interaction.member)
                successEmbed.setDescription(`Successfully removed you from the current episode.`);

                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            }
        }
        else if (subcommand === "pause") {
            const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);
            thread.send("Pausing episode!");

            currentEpisode.episodeLength = "" + (Date.now() - thread.createdAt);

            await currentEpisode.save();

            const successEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `Pausing Current Episode`, `paused the current episode.`, interaction.member)
            successEmbed.setDescription(`Paused Episode \`${thread.name}\``);

            await interaction.reply({ embeds: [successEmbed] });
            await thread.setArchived(true);
        }
        else if (subcommand === "unpause") {
            const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);

            await thread.setArchived(false);

            currentEpisode.episodeLength = "" + (Date.now() - currentEpisode.episodeLength);

            await currentEpisode.save();

            const successEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `unpausing Current Episode`, `unpaused the current episode.`, interaction.member)
            successEmbed.setDescription(`Unpaused Episode \`${thread.name}\``);

            await interaction.reply({ embeds: [successEmbed] });
            thread.send("Episode unpaused!");
        }
        else if (subcommand === "stop") {

            const thread = interaction.guild.channels.cache.get(currentEpisode.threadId);
            thread.send("Ending episode!");

            currentEpisode.name = thread.name;
            if (currentEpisode.episodeLength !== "") currentEpisode.episodeLength = msToTime(Date.now() - parseInt(currentEpisode.episodeLength));
            else currentEpisode.episodeLength = msToTime(Date.now() - thread.createdAt);
            currentEpisode.current = false;

            await currentEpisode.save();

            EpisodeUtils.currentEpisode = null;

            const successEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `Stopping Current Episode`, `stopped the current episode.`, interaction.member)
            successEmbed.setDescription(`Ended Episode \`${thread.name}\``);

            await interaction.reply({ embeds: [successEmbed] });
            await thread.setArchived(true);
        }
    }
}
