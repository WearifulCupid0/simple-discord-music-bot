module.exports = {
    config: {
        name: "skip",
        aliases: ["pular"],
    },
    run: async(client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if(!player) return message.channel.send(`Eu não estou tocando nada aqui!`);
        else if(player.voiceChannel.id !== message.member.voice.channel.id) 
        return message.channel.send(`Eu não estou no mesmo canal que o seu!`);

        let memberCount = message.member.voice.channel.members.size - 1;
        if(memberCount === 1) {
            player.skip();
            message.channel.send(`Pulei!`);
            return;
        };
        let required;

        memberCount % 2 == 0 ? required = Math.ceil(memberCount / 2) + 1 : required = Math.ceil(memberCount / 2);

        if(player.skipVotes.includes(message.author.id)) return message.channel.send(`Você já votou!`);

        player.skipVotes.push(message.author.id);

        message.channel.send(`Pular? ${player.skipVotes.length}/${required}`);

        if(player.skipVotes.length >= required) {
            player.resetVotes();
            player.skip();
            message.channel.send(`Pulei!`);
            return;
        };
    },
};