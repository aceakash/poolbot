import { equal, ok, fail } from 'assert'
import { EventStore } from '../eventStore';
import { resultHandler, InChannelResponse } from './resultHandler';
import { InMemoryEventStoreRepo } from '../InMemoryEventStoreRepo';
import { AddResultCommand, PlayerAlreadyRegisteredError, PairAlreadyPlayedTodayError } from '../commands';
import { ResultAdded, PlayerRegistered } from '../events';

describe('resultHandler', () => {
    it('error if no players specified', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))

        const query = { user_name: 'akash', text: 'result' };
        const resp: string|InChannelResponse = resultHandler(query, fakeEventStore)
        
        const expectedSnippet = 'Wrong format'
        if (typeof resp !== 'string') {
            return fail('Expected string return value')
        }
        ok(resp.includes(expectedSnippet), `Expected "${resp}" to include "${expectedSnippet}"`)
        equal(fakeEventStore.GetAllEvents().length, 0, 'Event list should not have changed')
    })

    it('error if only one player specified', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([new PlayerRegistered('alice')])

        const query = { user_name: 'akash', text: 'result @alice' };
        const resp: string|InChannelResponse = resultHandler(query, fakeEventStore)
        
        const expectedSnippet = 'Wrong format'
        if (typeof resp !== 'string') {
            return fail('Expected string return value')
        }
        ok(resp.includes(expectedSnippet), `Expected "${resp}" to include "${expectedSnippet}"`)
        equal(fakeEventStore.GetAllEvents().length, 1, 'Event list should not have changed')
    })

    it('error if first player not registered', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([new PlayerRegistered('bob')])

        const query = { user_name: 'akash', text: 'result alice bob' };
        const resp: string|InChannelResponse = resultHandler(query, fakeEventStore)
        
        const expected = 'Player alice is not registered'
        if (typeof resp !== 'string') {
            return fail('Expected string return value')
        }
        equal(resp, expected)
        equal(fakeEventStore.GetAllEvents().length, 1, 'Event list should not have changed')
    })

    it('error if second player not registered', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([new PlayerRegistered('alice')])

        const query = { user_name: 'akash', text: 'result alice bob' };
        const resp: string|InChannelResponse = resultHandler(query, fakeEventStore)
        
        const expected = 'Player bob is not registered'
        if (typeof resp !== 'string') {
            return fail('Expected string return value')
        }
        equal(resp, expected)
        equal(fakeEventStore.GetAllEvents().length, 1, 'Event list should not have changed')
    })

    it('error if players have already played on the day', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([
            new PlayerRegistered('alice'), 
            new PlayerRegistered('bob'),
            new ResultAdded('alice', 'bob', 'an_observer')
        ])

        const resp = resultHandler({ user_name: 'another_observer', text: 'result bob alice'}, fakeEventStore)
        equal(resp, 'Pair has already played today')
        equal(fakeEventStore.GetAllEvents().length, 3)
    })

    it('adds result if all ok', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([
            new PlayerRegistered('alice'), 
            new PlayerRegistered('bob')
        ])

        const resp = resultHandler({ user_name: 'an_observer', text: 'result alice bob'}, fakeEventStore)
        const allEvents = fakeEventStore.GetAllEvents()
        equal(allEvents.length, 3)
        equal(allEvents[2].Type, 'ResultAdded')
        equal(allEvents[2].Data, {})
    })
})