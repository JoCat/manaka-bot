import fs from "fs"
import { join } from "path"

import FileHelper from "./helpers/FileHelper"

export default class JsonDBManager {
    private dbFile = join(FileHelper.runtimeDir, "DB.json")
    private db: Record<string, Table> = {}

    constructor() {
        if (fs.existsSync(this.dbFile)) {
            try {
                this.db = JSON.parse(fs.readFileSync(this.dbFile).toString())
            } catch (error) {
                console.error("Json syntax broken. Try fix or delete DB.json")
                console.error(error)
                process.exit(1)
            }
        } else {
            fs.writeFileSync(this.dbFile, "{}")
        }
    }

    public addData(tableName: string, data: Entry): void {
        const table = this.getTable(tableName)
        table.lastInsertID++
        table.entries.push({
            id: table.lastInsertID,
            ...data,
        })
        this.saveDB()
    }

    public deleteData(
        tableName: string,
        key: string,
        value: string | number
    ): void {
        const table = this.getTable(tableName).entries
        table.splice(
            table.findIndex((e) => e[key] === value),
            1
        )
        this.saveDB()
    }

    public getData(tableName: string, id: number): Entry {
        return this.getTable(tableName).entries.find((e) => e.id === id)
    }

    public getAllData(tableName: string): Entry[] {
        return this.getTable(tableName).entries
    }

    private getTable(tableName: string) {
        if (this.db[tableName] === undefined) {
            this.db[tableName] = {
                lastInsertID: 0,
                entries: [],
            }
            this.saveDB()
        }
        return this.db[tableName]
    }

    private saveDB() {
        fs.writeFileSync(this.dbFile, JSON.stringify(this.db, null, 4))
    }
}

interface Table {
    lastInsertID: number
    entries: Entry[]
}

type Entry = any
