import { EventStore } from "../eventStore";
import { EventType, ResultAdded } from "../events"

interface stat {
    opponentName: string;
    won: number;
    lost: number;
}

export function h2hForPlayer(eventStore: EventStore, playerName: string): Map<string, stat> {
    let h2h = new Map<string, stat>()
    
    eventStore.GetAllEvents().filter(e => e.Type === EventType.ResultAdded)
        .forEach(_ => {
            const e = (_ as ResultAdded)

            
            if (e.WinnerName === playerName) {
                const opponentName = e.LoserName

                let currentH2H = h2h.get(opponentName)
                if (currentH2H == null) {
                    currentH2H = {
                        opponentName: opponentName,
                        won: 1,
                        lost: 0
                    }
                } else {
                    currentH2H.won = currentH2H.won + 1
                }
                h2h.set(opponentName, currentH2H)
            } else if (e.LoserName === playerName) {
                const opponentName = e.WinnerName

                let currentH2H = h2h.get(opponentName)
                if (currentH2H == null) {
                    currentH2H = {
                        opponentName: opponentName,
                        won: 0,
                        lost: 1
                    }
                } else {
                    currentH2H.lost = currentH2H.lost + 1
                }
                h2h.set(opponentName, currentH2H)
            }
        })
    return h2h
}