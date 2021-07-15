const Api = require("../structures/Api");
const Playlist = require("../structures/Playlist");
const Track = require("../structures/Track");
const SearchResults = require("../structures/SearchResults");
const chalk = require("chalk");
const fetch = require("node-fetch").default;
const cheerio = require("cheerio");

const API_URL = 'http://api-v2.soundcloud.com';
const APP_SCRIPT_CLIENT_ID_REGEX = /,client_id:"(.*?)"/

const SOUNDCLOUD_TRACK_REGEX = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
const SOUNDCLOUD_SET_REGEX = /^https?:\/\/soundcloud\.com\/(.*)\/sets\/(.*)$/;

module.exports = class SoundCloudApi extends Api {
    constructor(musicClient) {
        super({
            name: "soundcloud",
        }, musicClient);
        this.clientID = null;
    };
    getType(query) {
        if(SOUNDCLOUD_SET_REGEX.test(query)) return 'playlist';
        else if(SOUNDCLOUD_TRACK_REGEX.test(query)) return 'track';
        else return 'search';
    };
    async getInfo(query) {
        const type = this.getType(query);
        let res;
        switch(type) {
            case 'playlist': res = await this.playlistProvider(query);
            break;
            case 'track': res = await this.trackProvider(query);
            break;
            case 'search': res = await this.searchProvider(query);
            break;
        };
        return res;
    };
    async playlistProvider(query) {
        let o;
        await this.request('/resolve', { url: encodeURI(query) })
        .then(async res => {
            const tracks = await Promise.all(res.tracks.map(track => this.trackIDprovider(track.id)))
            o = new SearchResults({
                loadType: 'PLAYLIST_LOADED',
                exeption: {},
                playlistInfo: new Playlist({ title: res.title, author: res.user.username, uri: res.permalink_url, identifier: res.id }),
                tracks: tracks.map(a => a.tracks[0]).filter(a => !a === false)
            });
            
        })
        .catch(e => o = new SearchResults({
            playlistInfo: {},
            exeption: { error: this.clean(e) },
            tracks: [],
            loadType: 'LOAD_FAILED',
        }));
        return o;
    };
    async trackIDprovider(id) {
        let p;
        await this.request(`/tracks/${id}`)
        .then(res => {
            const track = new Track({
                title: res.title,
                author: res.user.username,
                duration: res.duration,
                uri: res.permalink_url,
                artwork: res.artwork_url ? res.artwork_url.replace('large', 't500x500') : res.user.avatar_url ? res.user.avatar_url.replace('large', 't500x500') : 'https://i1.sndcdn.com/avatars-HvS8x3gDzSME3LpE-ZQfuew-t500x500.jpg',
                identifier: res.id,
                isStream: false,
            });
            p = new SearchResults({
                playlistInfo: {},
                exeption: {},
                loadType: 'TRACK_LOADED',
                tracks: [track],
            });
        })
        .catch(err => p = new SearchResults({
            playlistInfo: {},
            exeption: { error: this.clean(err) },
            tracks: [],
            loadType: 'LOAD_FAILED',
        }));
        return p;
    };
    async trackProvider(query) {
        let u;
        await this.request('/resolve', { url: encodeURI(query) })
        .then(res => {
            const track = new Track({
                title: res.title,
                author: res.user.username,
                duration: res.duration,
                uri: res.permalink_url,
                artwork: res.artwork_url ? res.artwork_url.replace('large', 't500x500') : res.user.avatar_url ? res.user.avatar_url.replace('large', 't500x500') : 'https://i1.sndcdn.com/avatars-HvS8x3gDzSME3LpE-ZQfuew-t500x500.jpg',
                identifier: res.id,
                isStream: false,
            });
            u = new SearchResults({
                playlistInfo: {},
                exeption: {},
                loadType: 'TRACK_LOADED',
                tracks: [track],
            });
        })
        .catch(err => u = new SearchResults({
            playlistInfo: {},
            exeption: { error: this.clean(err) },
            loadType: 'LOAD_FAILED',
            tracks: [],
        }));
        return u;
    };
    async searchProvider(query) {

    };
    request(endpoint, queryParams = {}) {
        return new Promise(async(resolve, reject) => {
        if(this.clientID === null) await this.getClientID();
        queryParams['client_id'] = this.clientID;
        let qParams = new URLSearchParams(queryParams);
        return fetch(API_URL + endpoint + `?${qParams.toString()}`)
        .then(async res => {
            if(!res.ok) {
                await this.getClientID();
                queryParams['client_id'] = this.clientID;
                qParams = new URLSearchParams(queryParams);
                fetch(API_URL + endpoint + `?${qParams.toString()}`)
                .then(a => a.ok ? resolve(a.json()) : reject(a.ok))
                .catch(m => reject(m));
            } else resolve(res.json());
        }).catch(e => reject(e));
    });
    };
    async getClientID() {
    console.log(`[${chalk.hex('#ff7700')('SoundCloud')}] Gerando novo ClientID do Soundcloud, atual: ${this.clientID ? this.clientID : 'nenhum'}`)
    const $ = await fetch('https://soundcloud.com').then(async r => cheerio.load(await r.text()))
    const elements = $('script[src*="sndcdn.com/assets/"][src$=".js"]').get()
    elements.reverse()

    const headers = { 'Range': 'bytes=0-16384' }
    for (let i = 0; i < elements.length; i++) {
      const src = elements[i].attribs.src
      if (src) {
        try {
          const srcContent = await fetch(src, { headers }).then(r => r.text());
          const [ , clientId ] = APP_SCRIPT_CLIENT_ID_REGEX.exec(srcContent);
          console.log(`[${chalk.hex('#ff7700')('SoundCloud')}] Soundcloud ClientID modificado para ${clientId}`);
          this.clientID = clientId
          return clientId;
        } catch (l) {};
      };
    };
    return null;
    };
    async getStream(track) {
        const { identifier } = JSON.parse(new Buffer(track, 'base64').toString('ascii'));
        const song = await this.request(`/tracks/${identifier}`);
        const stream = song.media.transcodings.find(s => s.preset.includes('mp3') || s.preset.includes('opus'))
        const res = await fetch(stream.url + `?client_id=${this.clientID}`)
        const json = await res.json();
        return json.url;
    };
};