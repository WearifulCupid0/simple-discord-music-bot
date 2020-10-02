const Api = require("../structures/Api");
const SearchResults = require("../structures/SearchResults");
const Playlist = require("../structures/Playlist");
const Track = require("../structures/Track");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const ytdl = require("ytdl-core");

const PLAYLIST_REGEX = /list=(.*)/;

module.exports = class YoutubeApi extends Api {
    constructor(musicManager) {
        super({
            name: 'youtube',
        }, musicManager);
    };
    getType(query) {
        if(PLAYLIST_REGEX.test(query)) {
            const [, id] = PLAYLIST_REGEX.exec(query);
            if(ytpl.validateID(id)) return 'playlist';
        }
        else if(ytdl.validateURL(query)) return 'track';
        else return 'search';
    };
    async getInfo(query) {
        let response;
        const type = this.getType(query);
        switch(type) {
            case "playlist": response = await this.playlistProvider(query);
            break;
            case "search": response = await this.searchProvider(query);
            break;
            case "track": response = await this.trackProvider(query);
            break;
        };
        return response;
    };
    playlistProvider(query) {
        return new Promise(async(resolve, reject) => {
            const playlistID = await ytpl.getPlaylistID(query).catch(e => {});
            if(playlistID) {
            ytpl(playlistID)
            .then(res => {
                const tracks = res.items.map(track => new Track({
                    title: track.title.replace(this.regex, ''),
                    author: track.author.name.replace(this.regex, ''),
                    duration: track.duration ? this.getDuration(track.duration) : this.defaultDuration,
                    uri: track.url_simple,
                    artwork: `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`,
                    identifier: track.id,
                    isStream: track.duration ? false : true,
                }));
                resolve(new SearchResults({
                    playlistInfo: new Playlist({ title: res.title, author: res.author.name, uri: res.url, identifier: res.id }),
                    loadType: 'PLAYLIST_LOADED',
                    exeption: {},
                    tracks,
                }));
            })
            .catch(error => {
                reject(new SearchResults({
                    loadType: 'LOAD_FAILED',
                    exeption: { error: this.clean(error) },
                    tracks: [],
                    playlistInfo: {},
                }))
            });
        } else reject(new SearchResults({
            loadType: 'LOAD_FAILED',
            exeption: { error: this.clean(new Error('PlaylistID Not Found!')) },
            tracks: [],
            playlistInfo: {},
        }));
        });
    };
    trackProvider(query) {
        return new Promise(async(resolve, reject) => {
        await ytdl.getInfo(query).then(info => {
            console.log(info.videoDetails.lengthSeconds)
            resolve(new SearchResults({
                loadType: 'TRACK_LOADED',
                playlistInfo: {},
                exeption: {},
                tracks: [new Track({
                    title: info.videoDetails.title.replace(this.regex, ''),
                    author: info.videoDetails.author.name.replace(this.regex, ''),
                    duration:  info.videoDetails.isLiveContent ? this.defaultDuration : info.videoDetails.lengthSeconds * 1000,
                    uri: info.videoDetails.video_url,
                    artwork: `https://i.ytimg.com/vi/${info.videoDetails.videoId}/mqdefault.jpg`,
                    identifier: info.videoDetails.videoId,
                    isStream: info.videoDetails.isLiveContent
                })]
            }));
        })
        .catch(error => {
            reject(new SearchResults({
                loadType: 'LOAD_FAILED',
                exeption: { error: this.clean(error) },
                tracks: [],
                playlistInfo: {},
            }))
        });
        });
    };
    searchProvider(query) {
        return new Promise(async(resolve, reject) => {
            ytsr(query).then(res => {
                const videos = res.items.filter(a => a.type === "video");
                const tracks = videos.map(track => {
                    const identifier = ytdl.getVideoID(track.link);
                    return new Track({
                        title: track.title.replace(this.regex, ''),
                        author: track.author.name.replace(this.regex, ''),
                        duration: track.duration ? this.getDuration(track.duration) : this.defaultDuration,
                        uri: track.link,
                        artwork: `https://i.ytimg.com/vi/${identifier}/mqdefault.jpg`,
                        identifier,
                        isStream: track.duration ? false : true,
                    });
                });
                resolve(new SearchResults({
                    playlistInfo: {},
                    exeption: {},
                    loadType: 'SEARCH_RESULTS',
                    tracks,
                }));
            })
            .catch(error => {
                reject(new SearchResults({
                    loadType: 'LOAD_FAILED',
                    exeption: { error: this.clean(error) },
                    tracks: [],
                    playlistInfo: {},
                }))
            });
        });
    };
    getDuration(duration) {
        const args = duration.split(':')
        if (args.length === 3) {
            return parseInt(args[0]) * 60 * 60 * 1000 +
            parseInt(args[1]) * 60 * 1000 +
            parseInt(args[2]) * 1000
        } else if (args.length === 2) {
            return parseInt(args[0]) * 60 * 1000 +
            parseInt(args[1]) * 1000
        } else {
            return parseInt(args[0]) * 1000
        };
    };
    getStream(track) {
        const { uri } = JSON.parse(new Buffer(track, 'base64').toString('ascii'));
        const stream = ytdl(uri);
        return stream;
    };
};