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

    Decide(cmd: Command): Event[] | Error {
        return cmd.Decide(this)
    }

    AddEvents(events: Event[]): void {
        this.eventStoreRepo.AddEvents(events)
    }

    GetAllEvents(): Event[] {
        const boo = this.DeserialiseAllEvents(this.eventStoreRepo.GetAllEvents())
        return boo
    }

    DeserialiseAllEvents(events: Event[]): Event[] {
        return (events.map(function (e: Event) {
            let out: Event | null
            switch(e.Type) {
                case EventType.PlayerRegistered:
                    out = PlayerRegistered.DeserialiseFromEvent(e)
                    break
                
                case EventType.ResultAdded:
                    out = ResultAdded.DeserialiseFromEvent(e)
                    break
                    
                default:
                    out = e
            }
            if (out != null) {
                out.CreatedOn = new Date(out.CreatedOn)
            }
            return out
        }) as Event[])
    }
}
