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
}

export class AddResultCommand extends Command {
    WinnerName: string;
    LoserName: string;
    AdditionalData: any;
    Type: CommandType;    

    constructor(winnerName: string, loserName: string) {
        super()
        this.WinnerName = winnerName
        this.LoserName = loserName
        this.Type = CommandType.AddResult
    }
}
