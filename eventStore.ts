import { Command, CommandType, AddResultCommand, RegisterPlayerCommand } from './commands';
import {Event, EventType, PlayerRegistered, ResultAdded} from './events';

export interface EventStoreRepo {
    AddEvents(events: Event[]): void
    GetAllEvents(): Event[];
}

export class EventStore {
    private eventStoreRepo: EventStoreRepo

    constructor(eventStoreRepo: EventStoreRepo) {
        this.eventStoreRepo = eventStoreRepo
    }

    Decide(cmd: Command): Event[] {
        return cmd.Decide()
    }

    AddEvents(events: Event[]): void {
        this.eventStoreRepo.AddEvents(events)
    }

    GetAllEvents(): Event[] {
        // console.log(this.eventStoreRepo.GetAllEvents())
        const boo = this.DeserialiseAllEvents(this.eventStoreRepo.GetAllEvents())
        // console.log(boo)
        return boo
    }

    DeserialiseAllEvents(events: Event[]): Event[] {
        return (events.map(function (e: Event) {
            switch(e.Type) {
                case EventType.PlayerRegistered:
                    // console.log('EventType.PlayerRegistered')
                    const boo = PlayerRegistered.DeserialiseFromEvent(e)
                    // console.log(boo)
                    return boo
                
                case EventType.ResultAdded:
                    // console.log('EventType.ResultAdded')
                    return ResultAdded.DeserialiseFromEvent(e)
                
                default:
                    return e
            }
        }) as Event[])
    }
}
