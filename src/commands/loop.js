module.exports = {
    config: {
        name: "loop",
        aliases: ["repeat", "repetir"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        else if(player.voiceChannel.id !== message.member.voice.channel.id) 
        return message.channel.send(`Eu não estou no mesmo canal que o seu!`)
        switch(args.join(" ")) {
            case "track": 
            if(player.trackRepeat) {
            player.repeat("track", false);
            message.channel.send(`Loop de música desativado!`);
            } else {
            player.repeat("track", true);
            message.channel.send(`Loop de música ativado!`);
            };
            break;
            case "queue": 
            if(player.queueRepeat) {
            player.repeat("queue", false);
            message.channel.send(`Loop de fila de músicas desativado!`);
            } else {
            player.repeat("queue", true);
            message.channel.send(`Loop de fila de músicas ativado!`);
            };
            break;
            default: 
            if(player.queueRepeat) {
            player.repeat("queue", false);
            message.channel.send(`Loop de fila de músicas desativado!`);
            } else {
            player.repeat("queue", true);
            message.channel.send(`Loop de fila de músicas ativado!`);
            };
            break;
        };
    },
};