function syllableCounter(word) {

    const lowerWord = word.toLowerCase();
    let count = 0

    let vowels = "aeiouy"
    if (vowels.indexOf(lowerWord[0]) !== -1) {
        count += 1
    }
    for (let index = 1; index < lowerWord.length; index++) {
        if (vowels.indexOf(lowerWord[index]) !== -1 && vowels.indexOf(lowerWord[index - 1]) === -1) {
            count += 1
        }
    }
    if (vowels.indexOf(word.charAt(word.length - 1)) !== -1 && vowels.indexOf(word.charAt(word.length - 2)) === -1) {
        count -= 1
    }

    if (count === 2) {
        return 1;
    }
    else {
        return 0;
    }
}

module.exports = {
    name: 'messageCreate',

    execute(message) {
        if (message.author.bot) return false;

        if (message.content.indexOf(' ') > -1)
            return;

        let valid

        let squoatlingCheck = message.content.toLowerCase().indexOf("squ");

        if (squoatlingCheck !== -1) {
            valid = syllableCounter(message.content);
        }
        else {
            return;
        }

        if (valid) {
            message.channel.send(`${message.author}, ${message.content} is a valid squoatling name.`);
        }
        else {
            message.channel.send(`${message.author}, ${message.content} is not a valid squoatling name.`);
        }
    },
};