const { MessageEmbed } = require("discord.js");
const chalk = require("chalk");
const ytdl = require("ytdl-core-discord");
module.exports = class Player {
    constructor(client, connection, voiceChannel, textChannel, guild) {

        this.client = client;

        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.guild = guild;

        this.connection = connection;
        this.dispatcher = null;

        this.playing = false;
        this.paused = false;

        this.trackRepeat = false;
        this.queueRepeat = false;

        this.volume = 100;

        this.message = null;
        this.allowSendMessages = true;

        this.queue = [];
        this.skipVotes = [];
    };
    async resetVotes() {
        this.skipVotes.splice(0);
    };
    async addPlaylistQueue(playlist) {
        playlist.forEach(track => this.queue.push(track));
        if(this.playing || this.dispatcher !== null) {} else { this.play() };
    };
    async addTrackQueue(track) {
        this.queue.push(track);
        if(this.playing || this.dispatcher !== null) {} else { this.play() };
    };
    async skip() {
        this.dispatcher.end();
    };
    async play() {
        console.log(`[${chalk.green("Player")}] O player do servidor ${this.guild.name} (${this.guild.id}) começou a tocar uma música!`);
        const stream = await ytdl(this.queue[0].uri, {
            highWaterMark: 1 << 25,
            filter: 'audioonly',
            opusEncoded: true,
        });
        this.dispatcher = this.connection.play(stream, {
            type: 'opus',
            bitrate: 'auto'
        });
        this.playing = true;
        this.sendMessage();
        this.setVolume(this.volume);
        this.dispatcher.on('finish', () => this.handleEvents());
    };
    async handleEvents() {
        console.log(`[${chalk.green("Player")}] O player do servidor ${this.guild.name} (${this.guild.id}) parou de tocar uma música!`);
        this.playing = false;
        this.dispatcher = null;
        this.resetVotes();
        this.deleteMessage();
        if(this.queue.length === 0) {
            this.client.music.delete(this.guild.id);
        } else if(this.trackRepeat) {
            this.play();
        } else if(this.queueRepeat) {
            this.queue.push(this.queue.shift());
            this.play();
        } else if(this.queue.length === 1) {
            this.queue.shift();
            this.client.music.delete(this.guild.id);
        } else  {
            this.queue.shift();
            this.play();
        };
    };
    async pause() {
        switch(this.paused) {
        case true: this.dispatcher.resume(); this.paused = false;
        break;
        case false: this.dispatcher.pause(); this.paused = true;
        break;
        };
    };
    async repeat(type, state) {
        if(type === "queue") this.queueRepeat = state;
        else if(type === "track") this.trackRepeat = state;
        else this.queueRepeat = state;
    };
    async stop() {
        this.queue.splice(0);
        this.dispatcher.end();
    };
    async setVolume(volume) {
        this.volume = volume;
        this.dispatcher.setVolumeLogarithmic(this.volume / 200);
    };
    sendMessage() {
        if(this.allowSendMessages) this.textChannel.send(new MessageEmbed()
        .setAuthor(`Tocando agora:`)
        .setThumbnail(this.queue[0].artworkUrl)
        .setTitle(this.queue[0].title)
        .setColor('RANDOM')
        .setURL(this.queue[0].uri)
        .setDescription(`Autor: ${this.queue[0].author} 
Adicionada pelo(a): ${this.queue[0].requester.username}
`)
        ).then(msg => this.message = msg);
    };
    deleteMessage() {
        if(this.allowSendMessages) {
            this.message.delete();
            this.message = null;
        };
    };
};