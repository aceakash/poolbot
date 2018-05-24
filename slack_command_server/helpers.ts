import {EventStore} from '../eventStore'
import {EventType, PlayerRegistered} from '../events'
import { EloRatingItem } from '../projections/eloRating';

export function sanitiseUserName(rawUserName: string) {
    rawUserName = rawUserName.toLowerCase().trim()
    if (rawUserName.startsWith('@')) {
        return rawUserName.substring(1)
    }
    return rawUserName
}

export function checkIfPlayersPresent(eventStore: EventStore, player1: string, player2: string): string {
    const allPlayers = eventStore.GetAllEvents()
        .filter(x => x.Type === EventType.PlayerRegistered)
        .map(x => (x as PlayerRegistered).PlayerName)

    let notFoundPlayers = []
    if (!allPlayers.includes(player1)) {
        notFoundPlayers.push(player1)
    }
    if (!allPlayers.includes(player2)) {
        notFoundPlayers.push(player2)
    }
    if (notFoundPlayers.length === 0) {
        return ''
    }
    return `Player${notFoundPlayers.length > 1 ? 's': ''} ${notFoundPlayers.join(' & ')} ${notFoundPlayers.length > 1 ? 'are': 'is'} not registered`
}

let nextWinText = -1
export function getWinText(winner: string, loser: string) {
    const snippets = [
        `Oh oh, ${winner} just walloped ${loser}!`,
        `It was close, but ${loser} didn't stand a chance against ${winner}.`,
        `${winner} thoroughly defeated ${loser}.`,
        `"What just happened?" wonders ${loser} as ${winner} takes a victory lap around the office.`,
        `${winner} triumphant as ${loser} suffers another humiliating defeat.`,
        `${loser} left in disbelief as ${winner} deals out shocking defeat.`,
        `${winner} strikes again! ${loser} still trying to figure out what happened.`,
        `${loser} left raging after resounding loss to ${winner}`,
        `${loser} was just handed a sickening defeat by ${winner}`,
        `${winner} coasts to an easy victory over a struggling ${loser}`,
        `${winner} can do no wrong! Easy victory over ${loser}!`,
        `Fret not, ${loser}, you'll get ${winner} next time!`
    ]
    nextWinText = (nextWinText + 1) % snippets.length
    return snippets[nextWinText]
}

export function getDateString(date: Date): string {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return date.toUTCString().substring(5, 11)
}

export interface RankChange {
    player: string;
    oldRank: number;
    newRank: number
}

export function getRankingChange(prevRatings: EloRatingItem[], 
    currentRatings: EloRatingItem[], 
    winner: string, 
    loser: string): [RankChange, RankChange]  {
        
}