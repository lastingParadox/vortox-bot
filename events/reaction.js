const { VortoxReact } = require('../utilities/enums');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.author.bot) {
            if (message.content.toLowerCase().includes("orb")) {
                await message.react(VortoxReact.ORB);
            }

            if (message.content.toLowerCase().includes("squoat")) {
                await message.react(VortoxReact.SQUOAT);
            }

        }
        else if (message.author.bot) {
            if (message.embeds.length > 0) {
                const embed = message.embeds[0];
                if (embed.description?.toLowerCase().includes("vote")) {
                    for (let i of VortoxReact.VOTE)
                        await message.react(i);
                }
            }
        }
    },
};
