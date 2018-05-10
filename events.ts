// import { User } from "./user";
import {v4 as newUUID} from "uuid";
import {has} from "lodash";

export enum EventType {
    Unknown = "Unknown",
    PlayerRegistered = "PlayerRegistered",
    ResultAdded = "ResultAdded"
}


export abstract class Event {
    EventID: string;        
    Type: EventType;
    CreatedOn: Date;
    Data: any;
    
    constructor(type: EventType, data: any) {
        this.EventID = newUUID()
        this.CreatedOn = new Date()
        this.Type = type
        this.Data = data
    }
}

export class PlayerRegistered extends Event {
    PlayerName: string;

    constructor(playerName: string) {
        super(EventType.PlayerRegistered, { playerName })
        this.PlayerName = playerName
    }

    static DeserialiseFromEvent(event: Event): Event|null {
        if (event.Type !== EventType.PlayerRegistered) {
            return null
        }
        let pre = (event as PlayerRegistered)
        pre.PlayerName = event.Data.playerName
        return pre
    }
}

export class ResultAdded extends Event {
    WinnerName: string;
    LoserName: string;
    AddedBy: string;

    constructor(winnerName: string, loserName: string, addedBy: string) {
        super(EventType.ResultAdded, { winnerName, loserName, addedBy })
        this.WinnerName = winnerName
        this.LoserName = loserName
        this.AddedBy = addedBy
    }

    static DeserialiseFromEvent(event: Event): Event|null {
        if (event.Type !== EventType.ResultAdded) {
            return null
        }
        let rae = (event as ResultAdded)
        rae.WinnerName = event.Data.winnerName
        rae.LoserName = event.Data.loserName
        rae.AddedBy = event.Data.addedBy
        return rae
    }
}

