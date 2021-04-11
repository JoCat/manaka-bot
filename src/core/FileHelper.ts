import fs from "fs"
import path from "path"

export default class FileHelper {
    static rootDir: string = path.resolve(__dirname, "../..")
    static runtimeDir: string = path.resolve(FileHelper.rootDir, "runtime")

    static createMissing(): void {
        if (!fs.existsSync(this.runtimeDir)) fs.mkdirSync(this.runtimeDir)
    }
}
