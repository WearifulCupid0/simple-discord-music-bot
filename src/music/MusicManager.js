const Player = require("./structures/Player");
const { Collection } = require("discord.js");
const { EventEmitter } = require("events");
const chalk = require("chalk");
const fs = require("fs");

module.exports = class MusicManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.players = new Collection();
        this.apis = {};
        this.client.on('messageDelete', async(message) => {
            const player = this.players.get(message.guild.id);
            if(player && player.message && message.id === player.message.id) return player.sendMessage();
        }).on("voiceStateUpdate", async(oldState, newState) => {
            if(this.client.guilds.cache.get(oldState.guild.id).me.voice.channel && this.client.guilds.cache.get(oldState.guild.id).me.voice.channel.members.size<2){
                const player = this.players.get(oldState.guild.id);
                player.textChannel.send(`Saindo do canal de voz, motivo: Estou sozinho nele!`);
                this.delete(oldState.guild.id);
            } else if(!this.client.guilds.cache.get(oldState.guild.id).me.voice.channel && this.players.get(oldState.guild.id)){
                const player = this.players.get(oldState.guild.id);
                player.textChannel.send(`Fui kickado do canal de voz! Desligando player...`);
                console.log(`[${chalk.red("MUSIC")}] Um player foi deletado no servidor ${oldState.guild.name} (${oldState.guild.id})`);
                player.deleteMessage();
                this.players.delete(oldState.guild.id);
            };
        }).on("channelDelete", (channel) => {
            const player = this.players.get(channel.guild.id);
            if(!player) return;
            if(player.textChannel.id === channel.id) { player.allowSendMessage(false) };
        });
    };
    async spawn(voiceChannel, textChannel, guild) {
        const connection = await this.client.channels.cache.get(voiceChannel.id).join();
        const voice = this.client.guilds.cache.get(guild.id).me.voice;
        voice.setSelfDeaf(this.client.config.entryConfig.selfdeaf || false);
        voice.setSelfMute(this.client.config.entryConfig.selfmute || false);
        const player = new Player(this.client, connection, voiceChannel, textChannel, guild);
        this.players.set(guild.id, player);
        console.log(`[${chalk.red("MUSIC")}] Um player foi criado no servidor ${guild.name} (${guild.id})`);
        return player;
    };
    async delete(guildID) {
        const player = this.players.get(guildID);
        if(!player) return false;
        const guild = this.client.guilds.cache.get(guildID)
        console.log(`[${chalk.red("MUSIC")}] Um player foi deletado no servidor ${guild.name} (${guild.id})`);
        this.client.guilds.cache.get(guildID).me.voice.channel.leave();
        return this.players.delete(guildID);
    };
    async search(query, requester) {
        let res;
        if(query.includes('soundcloud')) res = await this.apis.soundcloud.getInfo(query);
        else res = await this.apis.youtube.getInfo(query);
        res.tracks.forEach(t => t.addRequester(requester));
        return res;
    };
    handleSong(song, guildID) {
        const player = this.players.get(guildID);
        if(!player) return;
        player.queue.push(song);
        if(!player.playing && !player.paused) player.play();
    };
    handleSongs(songs, guildID) {
        const player = this.players.get(guildID);
        if(!player) return;
        songs.map(song => player.queue.push(song));
        if(!player.playing && !player.paused) player.play();
    };
};
