module.exports = {
    config: {
        name: "resume",
        aliases: ["despausar"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        else if(player.voiceChannel.id !== message.member.voice.channel.id) 
        return message.channel.send(`Eu não estou no mesmo canal que o seu!`)
        else if(!player.paused) return message.channel.send(`Eu já estou com o player tocando!`);
        else player.pause() && message.channel.send(`Música despausada!`)
    },
};