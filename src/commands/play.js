module.exports = {
    config: {
        name: "play",
        aliases: ["pplay", "tocar", "p"],
        cooldown: 10,
    },
    run: async(client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        const myVoiceChannel = message.guild.me.voice.channel;
        if(!voiceChannel) return message.channel.send(`Você não está em um canal de voz!`);
        if(myVoiceChannel && myVoiceChannel.id !== voiceChannel.id) return message.channel.send(`Eu já estou tocando em outro canal de voz!`);
        if(!args) return message.channel.send(`Você não falou nenhuma música!`);
        message.channel.send(`Pesquisando ${args.slice(0).join(" ")}`);
        const music = await client.music.search(args.slice(0).join(" "), message.author);
        if(!music || !music[0]) return message.channel.send(`Nenhuma música encontrada!`);
        let msg;
        music[0].isPlaylist
        ? msg = `Playlist adicionada com sucesso!`
        : msg = `${music[0].title} de ${music[0].author}`;
        message.channel.send(msg);
        let player = client.music.players.get(message.guild.id);
        if(!player) {
            player = await client.music.spawn(voiceChannel, message.channel, message.guild, { selfdeaf: true });
        };
        if(music[0].isPlaylist) return player.addPlaylistQueue(music);
        else return player.addTrackQueue(music[0]);
    },
};