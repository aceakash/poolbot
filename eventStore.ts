import { Command, CommandType, AddResultCommand, RegisterPlayerCommand } from './commands';
import {Event} from './events';

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
        return this.eventStoreRepo.GetAllEvents()
    }
}

