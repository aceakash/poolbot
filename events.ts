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
    
    constructor(type: EventType, data: any) {
        this.EventID = newUUID()
        this.CreatedOn = new Date()
        this.Type = type
    }
}

export class PlayerRegistered extends Event {
    constructor(playerName: string) {
        super(EventType.PlayerRegistered, { playerName })
    }
}

export class ResultAdded extends Event {
    constructor(winnerName: string, loserName: string, addedBy: string) {
        super(EventType.ResultAdded, { winnerName, loserName, addedBy })
    }
}

