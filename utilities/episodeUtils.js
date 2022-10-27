const Episode = require("../models/episodes");
const { MissingPermissionError, OwnerError } = require("./errors");
const { PermissionsBitField } = require("discord.js");
const {VortoxEmbed} = require("./embeds");
const {VortoxColor} = require("./enums");

class EpisodeUtils {

    static currentEpisode;

    static async start() {
        this.currentEpisode = await Episode.findOne({current: true});
    }

    static isCurrentEpisode() {
        return this.currentEpisode != null;
    }

    static isCombat() {
        return this.isCurrentEpisode() && this.currentEpisode.combat.players.length > 0
    }

    static checkEpisodeEmbed(member) {
        if (!this.isCurrentEpisode()) {
            let failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Unable to Access Episode!", `tried to access the current episode.`, member);
            failEmbed.setDescription(`There is no episode currently in progress!`);
            return failEmbed;
        }
        return null;
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
