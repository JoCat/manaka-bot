import fs from "fs"
import { join } from "path"

export default class FileHelper {
    static rootDir = join(__dirname, "..")
    static runtimeDir = join(FileHelper.rootDir, "runtime")

    static createMissing(): void {
        if (!fs.existsSync(this.runtimeDir)) fs.mkdirSync(this.runtimeDir)
    }
}
