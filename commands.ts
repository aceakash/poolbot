import {Event, PlayerRegistered, ResultAdded} from './events'

export enum CommandType {
    Unknown = 0,
    RegisterPlayer,
    AddResult
}

export abstract class Command {
    Type: CommandType;

    constructor() {
        this.Type = CommandType.Unknown
    }

    abstract Decide(): Event[]
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

    Decide(): Event[] {
        // todo: validate
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

    Decide(): Event[] {
        return [new ResultAdded(this.WinnerName, this.LoserName, this.AddedBy)]
    }
}
