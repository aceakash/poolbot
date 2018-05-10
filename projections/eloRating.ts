// for a single player, get their elo ratings
import {Event, EventType, PlayerRegistered, ResultAdded} from '../events'
import {EventStore} from '../eventStore'
import {values, sortBy, reverse} from 'lodash'

interface IRatingsHash {
    [playerName: string] : EloRatingItem;
} 

interface EloRatingItem {
    playerName: string;
    rating: number;
}

export function eloRating(eventStore: EventStore, 
    startingScore: number, constantFactor: number): EloRatingItem[] {
    
    const allEvents: Event[] = eventStore.GetAllEvents()
    // console.log(allEvents)
    
    // let eloRatingItems: EloRatingItem[] = []
    let playerRatings: IRatingsHash = {}
    
    allEvents.forEach(e => {
        if (e.Type === EventType.PlayerRegistered) {
            const pre = (e as PlayerRegistered)
            playerRatings[pre.PlayerName] = {playerName: pre.PlayerName, rating: startingScore}
        }

        if (e.Type === EventType.ResultAdded) {
            const rae = (e as ResultAdded)
            const winnerOldRating = playerRatings[rae.WinnerName].rating
            const loserOldRating = playerRatings[rae.LoserName].rating
            const {winnerNewRating, loserNewRating} = calculateNewEloRating(winnerOldRating, loserOldRating, constantFactor)
            playerRatings[rae.WinnerName].rating = winnerNewRating
            playerRatings[rae.LoserName].rating = loserNewRating
        }
    })
    
    return reverse(sortBy(values(playerRatings), 'rating'))
    // todo sort
}





interface newRatings {
    winnerNewRating: number;
    loserNewRating: number;
}

function calculateNewEloRating(winnerOldRating: number, loserOldRating: number, constantFactor: number): newRatings {
    const winnerTransformedRating = transformRating(winnerOldRating)
	const loserTransformedRating = transformRating(loserOldRating)
	const expectedWinnerScore = getExpectedScore(winnerTransformedRating, loserTransformedRating)
	const expectedLoserScore = getExpectedScore(loserTransformedRating, winnerTransformedRating)

	const winnerNewRating = winnerOldRating + constantFactor*(1-expectedWinnerScore)
	const loserNewRating = loserOldRating + constantFactor*(0-expectedLoserScore)

    return {
        winnerNewRating: Math.round(winnerNewRating),
        loserNewRating: Math.round(loserNewRating)
    }

    function transformRating(rating: number): number {
        const power = rating / 400
        return Math.pow(10, power)
    }
    
    function getExpectedScore(transformedRating: number, opponentsTransformedRating: number): number {
        return transformedRating / (transformedRating + opponentsTransformedRating)
    }
}