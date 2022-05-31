const fs = require("fs");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if(command.data.name === "8ball" || command.data.name === "dmg") {
            const episodeList = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`));
            const dm = episodeList.users.find(x => x.id === "DM");
            const user = episodeList.users.find(x => x.id === interaction.member.id);

            if (interaction.channel.id === episodeList.episodeThread) {
                if (user.turn === true) {

                    user.turn = false;

                    episodeList['users'][(episodeList.users.findIndex(element => element === user) + 1) % episodeList.users.length]['turn'] = true;

                    fs.writeFile(process.cwd() + `\\items\\episodes.json`, JSON.stringify(episodeList, null, 2), err => {
                        if (err) {
                            console.log(`Error writing to episodes.json.`, err);
                        }
                    });
                }

                else if (dm.ids.find(id => id === interaction.member.id) && dm.turn === true) {
                    dm.turn = false;

                    episodeList['users'][(episodeList.users.findIndex(element => element === dm) + 1) % episodeList.users.length]['turn'] = true;

                    fs.writeFile(process.cwd() + `\\items\\episodes.json`, JSON.stringify(episodeList, null, 2), err => {
                        if (err) {
                            console.log(`Error writing to episodes.json.`, err);
                        }
                    });
                }
            }


        }
    },
};