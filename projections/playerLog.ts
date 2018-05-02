import {Event, EventType} from '../events'
import {EventStore} from '../eventStore'

export interface PlayerLogItem {
    GameID: string
    PlayedOn: Date
    AddedBy: string
    WinnerName: string
    LoserName: string
}

export function playerLog(eventStore: EventStore, playerName: string): PlayerLogItem[] {
    return eventStore.GetAllEvents()
        .filter(e => e.Type === EventType.ResultAdded)
        .filter(e => e.Data.winnerName === playerName || e.Data.loserName === playerName)
        .map(e => ({
            GameID: e.EventID,
            PlayedOn: e.CreatedOn,
            AddedBy: e.Data.addedBy,
            WinnerName: e.Data.winnerName,
            LoserName: e.Data.loserName
        }))
}