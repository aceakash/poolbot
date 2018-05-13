import {playerLog, PlayerLogItem} from './playerLog'
import {EventStore, EventStoreRepo} from '../eventStore'
import {Event, PlayerRegistered, ResultAdded} from '../events'
import * as assert from 'assert'




class InMemoryEventStoreRepo implements EventStoreRepo {
    Events: Event[] = []

    AddEvents(events: Event[]): void {
        this.Events = this.Events.concat(events)
    }

    GetAllEvents(): Event[] {
        return Array.from(this.Events)
    }
}


function testPlayerLog() {
    const fakeEventStore = new EventStore(new InMemoryEventStoreRepo())
    fakeEventStore.AddEvents([
        new PlayerRegistered("A"), new PlayerRegistered("B"), new PlayerRegistered("C")
    ])
    fakeEventStore.AddEvents([new ResultAdded("A", "B", "A")])
    fakeEventStore.AddEvents([new ResultAdded("A", "B", "A")])
    fakeEventStore.AddEvents([new ResultAdded("B", "C", "A")])
    let log = playerLog(fakeEventStore, "A")
    
    
}

testPlayerLog()