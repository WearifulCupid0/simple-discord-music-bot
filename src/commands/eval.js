const { inspect } = require('util');
module.exports = {
    config: {
        name: "eval",
        aliases: ["ev"],
        cooldown: 0,
    },
    run: async(client, message, args) => {
        if(message.author.id !== client.config.devID) return;
        try {
            let input = args.slice(0).join(' ')
            let output = eval(input);

            if(typeof output !== "string") output = inspect(output);

            if(output.size > 1950) output = output.substr(0, 1950);

            message.channel.send(`**Saida:**\n\`\`\`js\n${output}\n\`\`\``)
        } catch (error) {
            message.channel.send(`**Error:**\n\`${error}\``);
        }
        
    }
}