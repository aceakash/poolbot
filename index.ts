import {EventStore} from './eventStore'
import {FileEventStoreRepo} from './fileEventStoreRepo'
import {RegisterPlayerCommand, AddResultCommand} from './commands'

import {playerLog} from './projections/playerLog'
const eventStore = new EventStore(new FileEventStoreRepo("./event-store.json"))


eventStore.AddEvents(eventStore.Decide(new AddResultCommand("akash.kurdekar", "tom.coakes", "akash.kurdekar")))
eventStore.AddEvents(eventStore.Decide(new AddResultCommand("akash.kurdekar", "jigs", "jigs")))
eventStore.AddEvents(eventStore.Decide(new AddResultCommand("tom.coakes", "jigs", "akash.kurdekar")))
eventStore.AddEvents(eventStore.Decide(new AddResultCommand("jigs", "tom.coakes", "jigs")))
console.log(playerLog(eventStore, "akash.kurdekar"))