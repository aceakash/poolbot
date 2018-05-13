import {EventStore} from './eventStore'
import {FileEventStoreRepo} from './fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand} from './commands'

import {playerLog} from './projections/playerLog'
import {eloRating} from './projections/eloRating'
import {h2hForPlayer} from './projections/h2h'
import {gameLog} from './projections/gameLog'

// test
import {convert} from './test-data-to-event-store'
convert()


const eventStore = new EventStore(new FileEventStoreRepo("./testEventStore.json"))

const table = eloRating(eventStore, 2000, 32)
const h2h = h2hForPlayer(eventStore, "akash.kurdekar")
const log = gameLog(eventStore, 2000, 32)
console.log(log)