const { MessageEmbed } = require("discord.js");
module.exports = {
    config: {
        name: "np",
        aliases: ["nowplaying", "tocandoagora"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        message.channel.send(new MessageEmbed()
        .setAuthor(`Tocando agora:`)
        .setThumbnail(player.queue[0].artworkUrl)
        .setTitle(player.queue[0].title)
        .setColor('RANDOM')
        .setURL(player.queue[0].uri)
        .setDescription(`Autor: ${player.queue[0].author} 
Adicionada pelo(a): ${player.queue[0].requester.username}
`))
    },
};