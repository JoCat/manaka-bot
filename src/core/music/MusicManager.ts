import Playlist from "./Playlist"

export default class MusicManager {
    private playlists: Map<string, Playlist> = new Map()

    getPlaylist(id: string): Playlist {
        if (!this.playlists.has(id)) this.createPlaylist(id)
        return this.playlists.get(id)
    }

    hasPlaylist(id: string): boolean {
        return this.playlists.has(id)
    }

    private createPlaylist(id: string) {
        const playlist = new Playlist()
        playlist.once("empty", () => {
            this.playlists.delete(id)
        })
        this.playlists.set(id, playlist)
    }
}
