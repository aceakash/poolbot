import { EventStore } from '../eventStore'
import {EloRatingItem, eloRating} from '../projections/eloRating'

import {padStart} from "lodash"

export function ratingsHandler(query: any, eventStore: EventStore, startingScore: number, constantFactor: number): string {
    const eloRatings = eloRating(eventStore, startingScore, constantFactor)
    const RankPadding = 3
    const NamePadding = 21
    const RatingPadding = 4
    const PlayedPadding = 3
    const WonPadding = 3
    const WonPercPadding = 6
    const BestRatingPadding = 4
    const PtsPerGamePadding = 8
    const CurrWinStreakPadding = 11
    const BestWinStreakPadding = 11

    const headerLine = padStart('#', RankPadding, ' ') + ' | ' 
        + padStart('', NamePadding, ' ') + ' | ' 
        + padStart('', RatingPadding, ' ') + ' | '
        + padStart('Best', BestRatingPadding, ' ') + ' | '
        + padStart('P', PlayedPadding, ' ') + ' | '
        + padStart('W', WonPadding, ' ') + ' | '
        + padStart('W%', WonPercPadding, ' ') + ' | '
        + padStart('Curr Streak', CurrWinStreakPadding, ' ') + ' | '
        + padStart('Best Streak', BestWinStreakPadding, ' ') + ' | '
        + padStart('Pts/Game', PtsPerGamePadding, ' ') + ' | '
        

    let i = 1
    const calcWonPerc = (x: EloRatingItem) => {
        let wonPerc = x.played === 0 ? 0 : (x.won * 100/x.played)
        return wonPerc.toFixed(2).toString()
    }    
    const calcPtsPerGame = (x: EloRatingItem) => {
        let ptsPerGame = x.played === 0 ? 0 : (x.rating - startingScore)/x.played
        return ptsPerGame.toFixed(2).toString()
    }
    const itemLines = eloRatings.map(x => padStart((i++).toString(), RankPadding, ' ') + ' | ' 
        + padStart(x.playerName, NamePadding, ' ') + ' | ' 
        + padStart(x.rating.toString(), RatingPadding, ' ') + ' | '
        + padStart(x.bestRating.toString(), BestRatingPadding, ' ') + ' | '
        + padStart(x.played.toString(), PlayedPadding, ' ') + ' | '
        + padStart(x.won.toString(), WonPadding, ' ') + ' | '
        + padStart(calcWonPerc(x), WonPercPadding, ' ') + ' | '
        + padStart(x.currentWinStreak.toString(), CurrWinStreakPadding, ' ') + ' | '
        + padStart(x.bestWinStreak.toString(), BestWinStreakPadding, ' ') + ' | '
        + padStart(calcPtsPerGame(x), PtsPerGamePadding, ' ') + ' | '
    )
    const textLines = headerLine + '\n' + itemLines.join('\n')
    return "```\n" + textLines + "\n```"
}