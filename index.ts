import {EventStore} from './eventStore'
import {FileEventStoreRepo} from './fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand} from './commands'

import {playerLog} from './projections/playerLog'
import {eloRating} from './projections/eloRating'
import {h2hForPlayer} from './projections/h2h'

// test
import {convert} from './test-data-to-event-store'

convert()


const eventStore = new EventStore(new FileEventStoreRepo("./testEventStore.json"))




// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))
// eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "akash.kurdekar","akash.kurdekar")))

// console.log(playerLog(eventStore, "akash.kurdekar"))

const table = eloRating(eventStore, 2000, 32)
console.log(table)
const h2h = h2hForPlayer(eventStore, "akash.kurdekar")
console.log(h2h)