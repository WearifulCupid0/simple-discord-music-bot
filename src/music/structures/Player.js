const { MessageEmbed } = require("discord.js");
const chalk = require("chalk");
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
    async skip() {
        this.dispatcher.end();
    };
    async setVoiceChannel(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.client.channels.cache.get(voiceChannel.id).join().then(c => this.connection = c);
    };
    async setTextChannel(textChannel) {
        this.textChannel = textChannel;
    };
    async getStream() {
        const song = this.queue[0];
        if(song.uri.includes('youtube')) return await this.client.music.apis.youtube.getStream(song.track);
        else return await this.client.music.apis.soundcloud.getStream(song.track);
    };
    async play() {
        console.log(`[${chalk.green("Player")}] O player do servidor ${this.guild.name} (${this.guild.id}) começou a tocar uma música!`);
        const stream = await this.getStream();
        this.dispatcher = await this.connection.play(stream);
        this.client.music.emit("trackStart", this, this.queue[0]);
        this.playing = true;
        this.sendMessage();
        this.setVolume(this.volume);
        this.dispatcher.on('finish', () => this.handleEvents());
    };
    async handleEvents() {
        console.log(`[${chalk.green("Player")}] O player do servidor ${this.guild.name} (${this.guild.id}) parou de tocar uma música!`);
        this.playing = false;
        this.dispatcher = null;
        this.client.music.emit("trackEnd", this, this.queue[0]);
        this.resetVotes();
        this.deleteMessage();
        if(this.queue.length === 0) {
            this.client.music.emit("queueEnd", this);
            this.client.music.delete(this.guild.id);
        } else if(this.trackRepeat) {
            this.play();
        } else if(this.queueRepeat) {
            this.queue.push(this.queue.shift());
            this.play();
        } else if(this.queue.length === 1) {
            this.queue.shift();
            this.client.music.emit("queueEnd", this);
            this.client.music.delete(this.guild.id);
        } else  {
            this.queue.shift();
            this.play();
        };
    };
    async pause() {
        switch(this.paused) {
        case true: this.dispatcher.resume(); 
        this.paused = false; 
        this.client.music.emit("pause", this, false);
        break;
        case false: this.dispatcher.pause(); 
        this.paused = true;
        this.client.music.emit("pause", this, true);
        break;
        };
    };
    async repeat(type, state) {
        if(type === "queue") this.queueRepeat = state;
        else if(type === "track") this.trackRepeat = state;
        else this.queueRepeat = state;
        this.client.music.emit("repeat", this, type, state);
    };
    async stop() {
        this.queue.splice(0);
        this.dispatcher.end();
    };
    async setVolume(volume) {
        this.volume = volume;
        this.client.music.emit("volume", this, volume);
        this.dispatcher.setVolumeLogarithmic(this.volume / 200);
    };
    async allowSendMessage(state) {
        this.allowSendMessages = state;
        this.client.music.emit("allowSendMessages", this, state);
    };
    sendMessage() {
        if(this.allowSendMessages) this.textChannel.send(new MessageEmbed()
        .setAuthor(`Tocando agora:`)
        .setThumbnail(this.queue[0].artwork)
        .setTitle(this.queue[0].title)
        .setColor('RANDOM')
        .setURL(this.queue[0].uri)
        .setDescription(`Autor: ${this.queue[0].author}\nAdicionado por: ${this.queue[0].requester.username}`)
        ).then(msg => this.message = msg);
    };
    deleteMessage() {
        if(this.allowSendMessages && this.message !== null) {
            this.message.delete();
            this.message = null;
        };
    };
};