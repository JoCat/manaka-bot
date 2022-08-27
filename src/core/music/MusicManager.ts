import Core from "core/Core"

import Playlist from "./Playlist"

export default class MusicManager {
    constructor(private core: Core) {}

    private playlists: Map<string, Playlist> = new Map()

    public getPlaylist(id: string): Playlist {
        if (!this.hasPlaylist(id)) this.createPlaylist(id)
        return this.playlists.get(id)
    }

    public hasPlaylist(id: string): boolean {
        return this.playlists.has(id)
    }

    private createPlaylist(id: string) {
        const playlist = new Playlist(this.core)
        playlist.once("empty", () => {
            this.playlists.delete(id)
        })
        this.playlists.set(id, playlist)
    }
}
