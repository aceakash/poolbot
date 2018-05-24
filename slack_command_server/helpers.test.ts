import { EloRatingItem } from "../projections/eloRating";
import { getRankingChange } from "./helpers";

describe('helpers', () => {
    describe('getRankingChange', () => {
        it('no rank change', () => {
            const prevRatings: EloRatingItem[] = [
                {playerName: 'alice', rating: 2000, won: 0, played: 0, currentWinStreak: 0, bestWinStreak: 0, bestRating: 2000},
                {playerName: 'bob', rating: 1000, won: 0, played: 0, currentWinStreak: 0, bestWinStreak: 0, bestRating: 1000}
            ]
            const currentRatings: EloRatingItem[] = [
                {playerName: 'alice', rating: 2100, won: 1, played: 1, currentWinStreak: 1, bestWinStreak: 1, bestRating: 2100},
                {playerName: 'bob', rating: 900, won: 0, played: 1, currentWinStreak: 0, bestWinStreak: 0, bestRating: 1000}
            ]

            const [winnerChange, loserChange] = getRankingChange(prevRatings, currentRatings, 'alice', 'bob')

            
        })
    })
})