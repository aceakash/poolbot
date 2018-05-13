import * as fs from 'fs'
import {v4 as newUUID} from "uuid";
import {Event, EventType, PlayerRegistered, ResultAdded} from './events'

export function convert() {
    const buf = fs.readFileSync('./test-data.json', 'utf-8')
    const src = JSON.parse(buf)
    let events:any = []
    
    Object.keys(src.Players).forEach(function (p: string) {
        const data = {
            "EventID": newUUID(),
            "CreatedOn": "2018-01-01T00:29:15.127Z",
            "Type": "PlayerRegistered",
            "Data": {
                "playerName": p
            }
        }
        events.push(data)
    })
    
    src.GameLog.Entries.forEach(function (e: any) {
        const data = {
            "EventID": newUUID(),
            "CreatedOn": e.Created.substr(0, 20) + "000Z",
            "Type": "ResultAdded",
            "Data": {
                "winnerName": e.Winner,
                "loserName": e.Loser,
                "addedBy": e.AddedBy
            }
        }
        events.push(data)    
    })

    const jsonData = JSON.stringify(events)
    fs.writeFileSync("testEventStore.json", jsonData, "utf-8")
    
}