module.exports = class SearchResults {
    constructor({ playlistInfo, exeption, loadType, tracks }) {
        this.playlistInfo = playlistInfo;
        this.exeption = exeption;
        this.loadType = loadType;
        this.tracks = tracks;
    };
};