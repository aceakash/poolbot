import { EventStore } from "../eventStore"
import {sanitiseUserName} from './helpers'
import {h2hForPlayer} from '../projections/h2h'

import {padStart, padEnd} from 'lodash'


export function h2hHandler(query: any, eventStore: EventStore): string {
    const parts = query.text.split(" ")
    if (parts.length !== 2) {
        return "Wrong format. Use `/pool h2h <user_name>`"
    }
    const playerName = sanitiseUserName(parts[1])
    const h2h = h2hForPlayer(eventStore, playerName)
    let h2hText = '```\nH2H for ' + playerName + ':\n\n'
    h2hText += Array.from(h2h.values())
        .map(x => `${padStart(x.won.toString(), 2, ' ')} - ${padEnd(x.lost.toString(), 2, ' ')} vs ${x.opponentName}`)
        .join('\n')
    h2hText += '\n```'
    return h2hText
}