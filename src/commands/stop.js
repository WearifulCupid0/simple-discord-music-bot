module.exports = {
    config: {
        name: "stop",
        aliases: ["parar"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        else if(player.voiceChannel.id !== message.member.voice.channel.id) 
        return message.channel.send(`Eu não estou no mesmo canal que o seu!`)
        else player.stop() && message.channel.send(`A música foi parada e a lista foi limpa!`)
    },
};