module.exports = class Track {
    constructor(item, requester, isPlaylist = false) {
        this.title = item.title;
        this.uri = item.link;
        this.duration = item.duration;
        this.author = item.author.name;
        this.artworkUrl = item.thumbnail;
        this.requester = requester;
        this.isPlaylist = isPlaylist;
    };
    get durationInMs() {
        if(this.duration) {
        const args = this.duration.split(':')
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
        } else {
            return 93487593457349857340580934
        }
    };
};
