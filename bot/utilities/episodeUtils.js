const Episode = require("../models/episodes");
const { MissingPermissionError, OwnerError } = require("./errors");
const { PermissionsBitField } = require("discord.js");

class EpisodeUtils {

    static async currentEpisode(guildId) {
        return Episode.findOne({current: true, guildId: guildId});
    }

    static async isCurrentEpisode(guildId) {
        let currentEpisode = await this.currentEpisode(guildId);
        return currentEpisode != null;
    }

    static async changeNickname(interaction, guildMember, nick) {
        try {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ChangeNickname)) throw new MissingPermissionError("Missing Permission ChangeNickname");
            if (interaction.user.id === interaction.guild.ownerId) throw new OwnerError("Cannot edit the guild owner's nickname.");
            await guildMember.setNickname(nick);
        } catch (err) {
            console.error(err.message);
        }
    }
}

module.exports = { EpisodeUtils }
