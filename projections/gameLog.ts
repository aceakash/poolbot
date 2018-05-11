import {Event, EventType, PlayerRegistered, ResultAdded} from '../events'
import {EventStore} from '../eventStore'
import {calculateNewEloRating, newRatings} from './eloRating'
import {sortBy, reverse} from 'lodash'

interface logItem {
    gameID: string;
    date: Date;
    winner: playerItem;
    loser: playerItem;
    addedBy: string;
}

interface playerItem {
    name: string;
    oldRating: number;
    newRating: number;
}

export function gameLog(eventStore: EventStore, startingScore: number, constantFactor: number): logItem[] {
    let log: logItem[] = []

    let playerRatings = new Map<string, number>()

    eventStore.GetAllEvents().filter(e => e.Type === EventType.PlayerRegistered)
        .forEach(_ => {
            const e = (_ as PlayerRegistered)
            playerRatings.set(e.PlayerName, startingScore)
        })

    eventStore.GetAllEvents().filter(e => e.Type === EventType.ResultAdded)
        .forEach(_ => {
            const e = (_ as ResultAdded)
            const winnerOldRating = playerRatings.get(e.WinnerName) as number
            const loserOldRating = playerRatings.get(e.LoserName) as number
            const newRatings = calculateNewEloRating(winnerOldRating, loserOldRating, constantFactor)
            playerRatings.set(e.WinnerName, newRatings.winnerNewRating)
            playerRatings.set(e.LoserName, newRatings.loserNewRating)
            log.push({
                gameID: e.EventID,
                date: e.CreatedOn,
                addedBy: e.AddedBy,
                winner: {
                    name: e.WinnerName,
                    oldRating: winnerOldRating,
                    newRating: newRatings.winnerNewRating
                },
                loser: {
                    name: e.LoserName,
                    oldRating: loserOldRating,
                    newRating: newRatings.loserNewRating
                }
            })
        })

    return reverse(sortBy(log, 'date'))
}