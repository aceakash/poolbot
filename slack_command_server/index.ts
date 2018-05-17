import * as express from 'express'
import {padStart, padEnd, take, sample} from 'lodash'

import {EventStore} from '../eventStore'
import {FileEventStoreRepo} from '../fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand, PairAlreadyPlayedTodayError} from '../commands'

import {playerLog} from '../projections/playerLog'
import {eloRating, EloRatingItem} from '../projections/eloRating'
import {gameLog, LogItem} from '../projections/gameLog'

import { PlayerRegistered, EventType, ResultAdded } from '../events';
import {sanitiseUserName} from './helpers'
import {resultHandler} from './resultHandler'
import { ratingsHandler } from './ratingsHandler';
import { h2hHandler } from './h2hHandler';
import { logHandler } from './logHandler';
import { registerHandler } from './registerHandler';
import { tableHandler } from './tableHandler';
import { helpHandler } from './helpHandler';

interface PlayerChange {
    before: number;
    after: number;
}

if (process.env.EVENT_STORE_FILE_PATH == null) {
    throw new Error('Env variable EVENT_STORE_FILE_PATH not provided')
}
const eventStore = new EventStore(new FileEventStoreRepo(process.env.EVENT_STORE_FILE_PATH))
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
            return res.send(ratingsHandler(query, eventStore, STARTING_SCORE, CONSTANT_FACTOR))

        case "table":
            return res.send(tableHandler(query, eventStore, STARTING_SCORE, CONSTANT_FACTOR))
        
        case "result":
            const resultResponse =  resultHandler(query, eventStore)
            if (typeof resultResponse === 'string') {
                return res.send(resultResponse)
            }
            return res.json(resultResponse)

        case "register":
            return res.send(registerHandler(query, eventStore, ADMIN_USERS))
        
        case "h2h":
             return res.send(h2hHandler(query, eventStore))

        case "log":
            return res.send(logHandler(query, eventStore, STARTING_SCORE, CONSTANT_FACTOR))

        case "help":
        default:
            return res.send(helpHandler())
    }
})

const port = process.env.PORT || 2222
app.listen(port, () => {
    console.log('Started on port ' + port)
})









