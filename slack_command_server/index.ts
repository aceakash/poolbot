import * as express from 'express'
import {padStart, padEnd, takeRight} from 'lodash'

import {EventStore} from '../eventStore'
import {FileEventStoreRepo} from '../fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand} from '../commands'

import {playerLog} from '../projections/playerLog'
import {eloRating, EloRatingItem} from '../projections/eloRating'
import {h2hForPlayer} from '../projections/h2h'
import {gameLog} from '../projections/gameLog'

// test
import {convert} from '../test-data-to-event-store'
import { PlayerRegistered, EventType, ResultAdded } from '../events';
convert()


const eventStore = new EventStore(new FileEventStoreRepo("./testEventStore.json"))
const STARTING_SCORE = 2000
const CONSTANT_FACTOR = 32

//---------
const app = express()

app.post('/slack', (req: express.Request, res: express.Response) => {
    const query = req.query
    //     { token: 'wK3JOoMyEQpTrj7qbIDcEqo7',
//   team_id: 'T025LDE84',
//   team_domain: 'acuris',
//   channel_id: 'C0V7YGVFS',
//   channel_name: 'pool',
//   user_id: 'U025LDE86',
//   user_name: 'akash.kurdekar',
//   command: '/pool',
//   text: 'result @akash.kurdekar @tejus',
//   response_url: 'https://hooks.slack.com/commands/T025LDE84/362550156837/BGUAtIxZb60WHA4kZcCzvesr' }


    const command = query['text'].split(' ')[0]

    switch(command) {
        case "ratings":
            return ratingsHandler(query, res)
        
        case "result":
            return resultHandler(query, res)

        // case "h2h":
        //     return h2hHandler(query, res)

        case "log":
            return logHandler(query, res)

        case "help":
            return helpHandler(query, res)

        default:
            return helpHandler(query, res)
    }
})

 


app.listen(2222)
console.log('Started on http://localhost:2222')


function helpHandler(query: any, res: express.Response) {
    res.send(`Valid commands are:
\`/pool help\`: show this help message
\`/pool ratings\`: see the ratings table
\`/pool result <winner> <loser>\`: add a result
\`/pool h2h <player_name>\`: see player's head-to-head stats vs everyone else
\`/pool log\`: see all the games played so far`)    
}

function logHandler(query: any, res: express.Response) {
    const results = eventStore.GetAllEvents().filter(x => x.Type === EventType.ResultAdded)
    const mostRecent = takeRight(results, 50).map(e => (e as ResultAdded)).map(e => {
        return '[' + getDateString(e.CreatedOn) + '] '
            + padEnd(e.WinnerName, 21, ' ') + ' '
            + 'defeated  '
            + padEnd(e.LoserName, 21, ' ') + ' '
            + 'added by '
            + padEnd(e.AddedBy, 21, ' ') + ' '
    })
    res.send(mostRecent.join('\n'))
}

function getDateString(date: Date): string {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return date.toUTCString().substring(5, 11)
}

function ratingsHandler(query: any, res: express.Response) {
    const eloRatings = eloRating(eventStore, STARTING_SCORE, CONSTANT_FACTOR)
    const RankPadding = 3
    const NamePadding = 21
    const RatingPadding = 4
    const PlayedPadding = 3
    const WonPadding = 3
    const WonPercPadding = 6
    const BestRatingPadding = 4
    const PtsPerGamePadding = 8

    const headerLine = padStart('#', RankPadding, ' ') + ' | ' 
        + padStart('', NamePadding, ' ') + ' | ' 
        + padStart('', RatingPadding, ' ') + ' | '
        + padStart('Best', BestRatingPadding, ' ') + ' | '
        + padStart('P', PlayedPadding, ' ') + ' | '
        + padStart('W', WonPadding, ' ') + ' | '
        + padStart('W%', WonPercPadding, ' ') + ' | '
        + padStart('Pts/Game', PtsPerGamePadding, ' ') + ' | '
        

    let i = 1
    const calcWonPerc = (x: EloRatingItem) => {
        let wonPerc = x.played === 0 ? 0 : (x.won * 100/x.played)
        return wonPerc.toFixed(2).toString()
    }    
    const calcPtsPerGame = (x: EloRatingItem) => {
        let ptsPerGame = x.played === 0 ? 0 : (x.rating - STARTING_SCORE)/x.played
        return ptsPerGame.toFixed(2).toString()
    }
    const itemLines = eloRatings.map(x => padStart((i++).toString(), RankPadding, ' ') + ' | ' 
        + padStart(x.playerName, NamePadding, ' ') + ' | ' 
        + padStart(x.rating.toString(), RatingPadding, ' ') + ' | '
        + padStart(x.bestRating.toString(), BestRatingPadding, ' ') + ' | '
        + padStart(x.played.toString(), PlayedPadding, ' ') + ' | '
        + padStart(x.won.toString(), WonPadding, ' ') + ' | '
        + padStart(calcWonPerc(x), WonPercPadding, ' ') + ' | '
        + padStart(calcPtsPerGame(x), PtsPerGamePadding, ' ') + ' | '
    )
    const textLines = headerLine + '\n' + itemLines.join('\n')
    res.send(textLines)
}

function resultHandler(query: any, res: express.Response) {
    const parts = query['text'].split(' ')
    if (parts.length !== 3) {
        res.send('Wrong format for adding result. Use `/pool result <winner> <loser>`')
        return
    }
    const [winnerName, loserName] = [sanitiseUserName(parts[1]), sanitiseUserName(parts[2])]
    const noPlayersFoundErrorText = checkIfPlayersPresent(winnerName, loserName)
    if (noPlayersFoundErrorText.length > 0) {
        res.send(noPlayersFoundErrorText)
        return
    }
    const events = eventStore.Decide(new AddResultCommand(winnerName, loserName, query['user_name']))
    eventStore.AddEvents(events)
    res.send('Result registered')
}

function sanitiseUserName(rawUserName: string) {
    rawUserName = rawUserName.toLowerCase().trim()
    if (rawUserName.startsWith('@')) {
        return rawUserName.substring(1)
    }
    return rawUserName
}

function checkIfPlayersPresent(player1: string, player2: string): string {
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