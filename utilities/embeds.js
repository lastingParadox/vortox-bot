const { EmbedBuilder } = require("discord.js");

class VortoxEmbed extends EmbedBuilder {

    #member
    #icon_url

    constructor(color, titleText, footerText, member) {
        super();
        this.#member = member
        this.#icon_url = this.#member.displayAvatarURL();
        this.setTitle(titleText).setColor(color);
        this.setFooter(footerText);
    }

    setFooter(text) {
        return super.setFooter({
            text: `${this.#member.displayName} ` + text,
            iconURL: this.#icon_url
        });
    }
}

module.exports = {
    VortoxEmbed
}
