import { EventStoreRepo } from "./eventStore";
import { Event } from "./events";
import {writeFileSync, readFileSync} from "fs"

export class FileEventStoreRepo implements EventStoreRepo {
    Events: any
    Filepath: string
    
    constructor(filepath: string) {
        this.Filepath = filepath
        let f = readFileSync(this.Filepath)
        let g = f.toString()
        this.Events = JSON.parse(g)
    }

    AddEvents(events: Event[]): void {
        this.Events = this.Events.concat(events)
        writeFileSync(this.Filepath, JSON.stringify(this.Events))
    }

    GetAllEvents(): Event[] {
        return this.Events
    }
}