import fs from "fs"
import { resolve } from "path"

export default class FileHelper {
    static rootDir = resolve(__dirname, "..")
    static runtimeDir = resolve(FileHelper.rootDir, "runtime")

    static createMissing(): void {
        if (!fs.existsSync(this.runtimeDir)) fs.mkdirSync(this.runtimeDir)
    }
}
