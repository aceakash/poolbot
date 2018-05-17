import { eloRating } from "../projections/eloRating";
import { EventStore } from "../eventStore";

import {padStart} from 'lodash'

export function tableHandler(query: any, eventStore: EventStore, startingScore: number, constantFactor: number): string {
    const eloRatings = eloRating(eventStore, startingScore, constantFactor)
    const RankPadding = 3
    const NamePadding = 21
    const RatingPadding = 4
    
    let i = 1
    const itemLines = eloRatings.map(x => padStart((i++).toString(), 2, '0') + ' | '
        + '(' + x.rating.toString() + ') '
        +  x.playerName
        
    )
    const textLines = itemLines.join('\n')
     return "```\n" + textLines + "\n```"
}