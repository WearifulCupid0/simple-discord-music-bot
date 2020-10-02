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
        client.music.players.get(message.guild.id) ? client.music.players.get(message.guild.id) : await client.music.spawn(message.member.voice.channel, message.channel, message.guild);
        message.channel.send(`Pesquisando ${args.slice(0).join(" ")}`);
        const response = await client.music.search(args.slice(0).join(" "), message.author);
        if(response.loadType === 'LOAD_FAILED') return message.channel.send('Um erro aconteceu buscando as músicas!');
        if(response.loadType === 'PLAYLIST_LOADED') client.music.handleSongs(response.tracks, message.guild.id);
        else client.music.handleSong(response.tracks[0], message.guild.id);
        message.channel.send(response.loadType == 'PLAYLIST_LOADED' ? `Playlist: ${response.playlistInfo.title}` : `${response.tracks[0].title} - ${response.tracks[0].author}`)
    },
};