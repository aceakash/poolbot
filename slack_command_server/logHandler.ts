import { EventStore } from "../eventStore";
import {sanitiseUserName, getDateString} from './helpers'

import {padStart, take} from 'lodash'
import { LogItem, gameLog } from "../projections/gameLog";
import { PlayerRegistered, EventType } from "../events";

export function logHandler(query: any, eventStore: EventStore, startingScore: number, constantFactor: number) {
    let logItems: LogItem[] = gameLog(eventStore, startingScore, constantFactor)

    const parts = query['text'].split(' ')
    if (parts.length > 1) {
        const playerName = sanitiseUserName(parts[1])
        const matchedPlayers = eventStore.GetAllEvents()
            .filter(x => x.Type === EventType.PlayerRegistered)
            .filter(x => (x as PlayerRegistered).PlayerName === playerName)
        if (matchedPlayers.length !== 1) {
            return `${playerName} is not registered. Try \`/pool log\``
        }
        logItems = logItems.filter(x => x.winner.name === playerName || x.loser.name === playerName)
    }

    const mostRecent = take(logItems, 50).map(e => {
        return '[' + getDateString(e.date) + '] '
            + padStart(e.winner.name, 21, ' ') + ' '
            + '(' + padStart(e.winner.oldRating.toString(), 4, ' ') + ' ⇨ '
            + padStart(e.winner.newRating.toString(), 4, ' ') + ') '
            + 'defeated  '
            + padStart(e.loser.name, 21, ' ') + ' '
            + '(' + padStart(e.loser.oldRating.toString(), 4, ' ') + ' ⇨ '
            + padStart(e.loser.newRating.toString(), 4, ' ') + ') '
            + 'added by '
            + padStart(e.addedBy, 21, ' ') + ' '
    })
    return "```\n" + mostRecent.join('\n') + "\n```"
}