import * as express from 'express'
import {padStart, padEnd, take} from 'lodash'

import {EventStore} from '../eventStore'
import {FileEventStoreRepo} from '../fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand} from '../commands'

import {playerLog} from '../projections/playerLog'
import {eloRating, EloRatingItem} from '../projections/eloRating'
import {h2hForPlayer} from '../projections/h2h'
import {gameLog, LogItem} from '../projections/gameLog'

import { PlayerRegistered, EventType, ResultAdded } from '../events';

interface PlayerChange {
    before: number;
    after: number;
}

const eventStore = new EventStore(new FileEventStoreRepo("./event-store.json"))
const STARTING_SCORE = 2000
const CONSTANT_FACTOR = 32
const ADMIN_USERS = ["akash.kurdekar"]

const app = express()

app.get('/slack', (req: express.Request, res: express.Response) => {
    const query = req.query
    console.log(`[${new Date().toISOString()}] ${query.user_name} in ${query.channel_name}: ${query.text}`)
    const command = query['text'].split(' ')[0]

    switch (command) {
        case "ratings":
            return ratingsHandler(query, res)

        case "table":
            return tableHandler(query, res)
        
        case "result":
            return resultHandler(query, res)

        case "register":
            return registerHandler(query, res)    
        
        case "h2h":
            return h2hHandler(query, res)

        case "log":
            return logHandler(query, res)

        case "help":
            return helpHandler(query, res)

        default:
            return helpHandler(query, res)
    }
})

app.listen(process.env.PORT, () => {
    console.log('Started on port ' + process.env.PORT)
})


function helpHandler(query: any, res: express.Response) {
    res.send(`Valid commands are:
\`/pool help\`: show this help message
\`/pool table\`: see a simple ratings table
\`/pool ratings\`: see an extended ratings table
\`/pool result <winner> <loser>\`: add a result
\`/pool h2h <player_name>\`: see player's head-to-head stats vs everyone else
\`/pool log\`: see the most recently played games
\`/pool log <user_name>\`: see a user's most recently played games`)    
}

function h2hHandler(query: any, res: express.Response) {
    const parts = query.text.split(" ")
    if (parts.length !== 2) {
        return res.send("Wrong format. Use `/pool h2h <user_name>`")
    }
    const playerName = sanitiseUserName(parts[1])
    const h2h = h2hForPlayer(eventStore, playerName)
    let h2hText = '```\nH2H for ' + playerName + ':\n\n'
    h2hText += Array.from(h2h.values())
        .map(x => `${padStart(x.won.toString(), 2, ' ')} - ${padEnd(x.lost.toString(), 2, ' ')} vs ${x.opponentName}`)
        .join('\n')
    h2hText += '\n```'
    res.send(h2hText)
}

function registerHandler(query: any, res: express.Response) {
    const isAdmin = ADMIN_USERS.includes(sanitiseUserName(query.user_name))
    if (!isAdmin) {
        return res.send("You are not authorised to register a new user. Please ask " + ADMIN_USERS.join(" or "))
    }
    const parts = query.text.split(" ")
    if (parts.length !== 2) {
        return res.send("Wrong format. Use `/pool register <user_name>`")
    }
    const newPlayer = sanitiseUserName(parts[1])
    const events = eventStore.Decide(new RegisterPlayerCommand(newPlayer))
    if (events.length === 0) {
        return res.send(`${newPlayer} is already registered`)
    }
    eventStore.AddEvents(events)
    res.send(`${newPlayer} registered`)
}

function logHandler(query: any, res: express.Response) {
    let logItems: LogItem[] = gameLog(eventStore, STARTING_SCORE, CONSTANT_FACTOR)

    const parts = query['text'].split(' ')
    if (parts.length > 1) {
        const playerName = sanitiseUserName(parts[1])
        const matchedPlayers = eventStore.GetAllEvents()
            .filter(x => x.Type === EventType.PlayerRegistered)
            .filter(x => (x as PlayerRegistered).PlayerName === playerName)
        if (matchedPlayers.length !== 1) {
            return res.send(`${playerName} is not registered. Try \`/pool log\``)
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
    res.send("```\n" + mostRecent.join('\n') + "\n```")    
}

function tableHandler(query: any, res: express.Response) {
    const eloRatings = eloRating(eventStore, STARTING_SCORE, CONSTANT_FACTOR)
    const RankPadding = 3
    const NamePadding = 21
    const RatingPadding = 4
    
    let i = 1
    const itemLines = eloRatings.map(x => padStart((i++).toString(), 2, '0') + ' | '
        + '(' + x.rating.toString() + ') '
        +  x.playerName
        
    )
    const textLines = itemLines.join('\n')
    res.send("```\n" + textLines + "\n```")
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
        + padStart(x.currentWinStreak.toString(), CurrWinStreakPadding, ' ') + ' | '
        + padStart(x.bestWinStreak.toString(), BestWinStreakPadding, ' ') + ' | '
        + padStart(calcPtsPerGame(x), PtsPerGamePadding, ' ') + ' | '
    )
    const textLines = headerLine + '\n' + itemLines.join('\n')
    res.send("```\n" + textLines + "\n```")
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

function getDateString(date: Date): string {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return date.toUTCString().substring(5, 11)
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