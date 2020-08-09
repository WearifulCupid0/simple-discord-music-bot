module.exports = {
    config: {
        name: "volume",
        aliases: ["vol"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        else if(!args.join(" ")) return message.channel.send(`Volume em \`${player.volume}%\`!`);
        else if(player.voiceChannel.id !== message.member.voice.channel.id) 
        return message.channel.send(`Eu não estou no mesmo canal que o seu!`)
        else if(isNaN(args.join(" "))) return message.channel.send(`Fale um número valido!`);
        else if(args.join(" ") < 1 || args.join(" ") > 200) return message.channel.send(`Fale um número entre 1 e 200!`);
        player.setVolume(args.join(" "));
        message.channel.send(`Volume alterado para \`${args}%\``)
    },
};