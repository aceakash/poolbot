import { EventStoreRepo } from "./eventStore";
import { Event } from "./events";


export class InMemoryEventStoreRepo implements EventStoreRepo {
    Events: any

    constructor(rawEvents: any) {
        this.Events = rawEvents
    }
    
    AddEvents(events: Event[]): void {
        this.Events = this.Events.concat(events)
    }

    GetAllEvents(): Event[] {
        return this.Events
    }
}