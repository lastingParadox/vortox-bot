const fs = require("fs");
const {workingDir} = require("../config.json");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if(command.data.name === "8ball") {
            const episodeList = JSON.parse(fs.readFileSync(workingDir + `items\\episodes.json`));
            const user = episodeList.users.find(x => x.id === interaction.member.id);

            if (interaction.channel.id === episodeList.episodeThread && user.turn === true && episodeList.users.length > 1) {

                user.turn = false;

                episodeList['users'][(episodeList.users.findIndex(user) + 1) % episodeList.users.length]['turn'] = true;

                fs.writeFile(workingDir + `items\\episodes.json`, JSON.stringify(episodeList, null, 2), err => {
                    if (err) {
                        console.log(`Error writing to episodes.json.`, err);
                        return;
                    }
                    else {
                        console.log(`episodes.json successfully written to!`);
                    }
                });
            }

        }
    },
};