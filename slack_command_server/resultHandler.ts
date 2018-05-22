import {checkIfPlayersPresent, sanitiseUserName, getWinText} from './helpers'
import { EventStore } from '../eventStore';
import {AddResultCommand, PairAlreadyPlayedTodayError} from '../commands'

export interface InChannelResponse {
    text: string;
    response_type: string;
}

export function resultHandler(query: any, eventStore: EventStore): string | InChannelResponse {
    const parts = query['text'].split(' ')
    if (parts.length !== 3) {
        return 'Wrong format for adding result. Use `/pool result <winner> <loser>`'
    }
    const [winnerName, loserName] = [sanitiseUserName(parts[1]), sanitiseUserName(parts[2])]
    const noPlayersFoundErrorText = checkIfPlayersPresent(eventStore, winnerName, loserName)
    if (noPlayersFoundErrorText.length > 0) {
        return noPlayersFoundErrorText
    }
    const addedBy = sanitiseUserName(query['user_name'])
    const events = eventStore.Decide(new AddResultCommand(winnerName, loserName, addedBy))
    if (events === PairAlreadyPlayedTodayError) {
        return 'Pair has already played today'
    }
    if (events instanceof Error) {
        console.error(events)
        return 'Oops something went wrong!'
    }
    eventStore.AddEvents(events)
    return {
        text: `${getWinText(winnerName, loserName)}\n(result added by ${addedBy})`,
        response_type: 'in_channel'
    }
    
}