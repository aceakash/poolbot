import {Event, PlayerRegistered, ResultAdded, EventType} from './events'
import { EventStore } from './eventStore';

export enum CommandType {
    Unknown = 0,
    RegisterPlayer,
    AddResult
}

export const PairAlreadyPlayedTodayError = new Error("Pair has already played today")

export abstract class Command {
    Type: CommandType;

    constructor() {
        this.Type = CommandType.Unknown
    }

    abstract Decide(eventStore: EventStore): Event[] | Error
}

export class RegisterPlayerCommand extends Command {
    Name: string;
    AdditionalData: any;
    Type: CommandType;

    constructor(name: string) {
        super()
        this.Name = name
        this.Type = CommandType.RegisterPlayer
    }

    Decide(eventStore: EventStore): Event[] | Error {
        const existing = eventStore.GetAllEvents()
            .filter(x => x.Type === EventType.PlayerRegistered)
            .filter(x => (x as PlayerRegistered).PlayerName === this.Name) 
        if (existing.length > 0) {
            return []
        }
        return [new PlayerRegistered(this.Name)]
    }

}

export class AddResultCommand extends Command {
    WinnerName: string;
    LoserName: string;
    AddedBy: string;
    AdditionalData: any;
    Type: CommandType;    

    constructor(winnerName: string, loserName: string, addedBy: string) {
        super()
        this.WinnerName = winnerName
        this.LoserName = loserName
        this.AddedBy = addedBy
        this.Type = CommandType.AddResult
    }

    Decide(eventStore: EventStore): Event[] | Error {
        const alreadyPlayed: boolean = this.havePlayersAlreadyPlayedToday(this.WinnerName, this.LoserName, eventStore)
        if (alreadyPlayed) {
            return PairAlreadyPlayedTodayError
        }
        return [new ResultAdded(this.WinnerName, this.LoserName, this.AddedBy)]
    }

    havePlayersAlreadyPlayedToday(player1: string, player2: string, eventStore: EventStore): boolean {
        const gamesPlayedbyPairToday = eventStore.GetAllEvents()
            .filter(x => x.Type === EventType.ResultAdded)
            .map(x => (x as ResultAdded))
            .filter(x => x.WinnerName === player1 || x.LoserName === player1)
            .filter(x => x.WinnerName === player2 || x.LoserName === player2)
            .filter(x => areSameDay(x.CreatedOn, new Date()))
        
        return gamesPlayedbyPairToday.length > 0
    }
}

function areSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
}


