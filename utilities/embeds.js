const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class VortoxEmbed extends EmbedBuilder {

    #member
    #icon_url

    constructor(color, titleText, footerText, member) {
        super();
        this.#member = member
        this.#icon_url = this.#member.displayAvatarURL();
        if (titleText !== "")
            this.setTitle(titleText);
        this.setColor(color);
        this.setFooter(footerText);
    }

    setFooter(text) {
        return super.setFooter({
            text: `${this.#member.displayName} ` + text,
            iconURL: this.#icon_url
        });
    }
}

class VortoxPages {
    #interaction;
    #pages;
    #time;
    #pageNum;
    #filter;

    constructor(interaction, pages, filter, time) {
        this.#interaction = interaction;
        this.#pages = pages;
        this.#filter = filter;
        this.#time = time;
        this.#pageNum = 0;
    }

    getRow() {
        const row = new ActionRowBuilder()

        row.addComponents([
            new ButtonBuilder()
                .setCustomId('first_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏮')
                .setDisabled(this.#pageNum === 0),
            new ButtonBuilder()
                .setCustomId('prev_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏪')
                .setDisabled(this.#pageNum === 0),
            new ButtonBuilder()
                .setCustomId('next_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏩')
                .setDisabled(this.#pageNum === this.#pages.length - 1),
            new ButtonBuilder()
                .setCustomId('last_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏭')
                .setDisabled(this.#pageNum === this.#pages.length - 1),
        ])

        return row;
    }

    async start() {
        const filter = this.#filter;
        const time = this.#time;

        const collector = await this.#interaction.channel.createMessageComponentCollector({ filter, time })

        await collector.on('collect', async btnInt => {
            if (!btnInt) return;
            await btnInt.deferUpdate();

            if (btnInt.customId !== 'prev_embed' &&
                btnInt.customId !== 'next_embed' &&
                btnInt.customId !== 'first_embed' &&
                btnInt.customId !== 'last_embed') {
                return;
            }
            if (btnInt.customId === 'first_embed' && this.#pageNum > 0) {
                this.#pageNum = 0
            }
            else if (btnInt.customId === 'prev_embed' && this.#pageNum > 0) {
                --this.#pageNum;
            }
            else if (btnInt.customId === 'next_embed' && this.#pageNum < this.#pages.length - 1) {
                ++this.#pageNum;
            }
            else if (btnInt.customId === 'last_embed' && this.#pageNum < this.#pages.length - 1) {
                this.#pageNum = this.#pages.length - 1;
            }

            await this.#interaction.editReply({ embeds: [this.#pages[this.#pageNum]], components: [this.getRow(this.#pageNum)] });
        })
    }
}

module.exports = {
    VortoxEmbed,
    VortoxPages
}
