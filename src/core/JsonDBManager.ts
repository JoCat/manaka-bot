import * as fs from "fs"
import * as path from "path"

export default class JsonDBManager {
    private configFile = path.resolve(__dirname, "../../runtime/DB.json")
    private db: Record<string, Table> = {}

    constructor() {
        if (fs.existsSync(this.configFile)) {
            try {
                this.db = JSON.parse(fs.readFileSync(this.configFile).toString())
            } catch (error) {
                console.error("Json syntax broken. Try fix or delete DB.json")
                console.error(error)
            }
        } else {
            fs.writeFileSync(this.configFile, "{}")
        }
    }

    addData(db: string, data: any) {
        const table = this.getTable(db)
        table.lastInsertID++
        table.entries.push({
            id: table.lastInsertID,
            ...data,
        })
        this.saveDB()
    }

    deleteData(db: string, key: string, value: any) {
        const table = this.getTable(db).entries
        table.splice(
            table.findIndex((e) => e[key] === value),
            1
        )
        this.saveDB()
    }

    getData(db: string, id: number) {
        return this.getTable(db).entries.find((e) => e.id === id)
    }

    getAllData(db: string) {
        return this.getTable(db).entries
    }

    private getTable(db: string) {
        if (this.db[db] === undefined) {
            this.db[db] = {
                lastInsertID: 0,
                entries: [],
            }
            this.saveDB()
        }
        return this.db[db]
    }

    private saveDB() {
        fs.writeFileSync(this.configFile, JSON.stringify(this.db, null, 4))
    }
}

interface Table {
    lastInsertID: number
    entries: any[]
}
