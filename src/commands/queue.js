module.exports = {
    config: {
        name: "queue",
        aliases: ["q"]
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Não estou tocando nada agora!`);
        else message.channel.send(`${player.queue.map((track, i) => `**${i}.** ${track.title}`).splice(0, 10).join('\n')}`);
    },
};