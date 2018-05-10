import * as fs from 'fs'
import {Event, EventType, PlayerRegistered, ResultAdded} from './events'

export function convert() {
    const buf = fs.readFileSync('./test-data.json', 'utf-8')
    const src = JSON.parse(buf)
    let events: Event[] = []
    
    Object.keys(src.Players).forEach(function (p: string) {
        events.push(new PlayerRegistered(p))    
    })
    
    src.GameLog.Entries.forEach(function (e: any) {
        events.push(new ResultAdded(e.Winner, e.Loser, e.AddedBy))    
    })



    const jsonData = JSON.stringify(events)
    fs.writeFileSync("testEventStore.json", jsonData, "utf-8")
    
}