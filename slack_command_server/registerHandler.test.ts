import { equal, ok } from 'assert'
import { EventStore } from '../eventStore';
import { registerHandler } from './registerHandler';
import { InMemoryEventStoreRepo } from '../InMemoryEventStoreRepo';
import { RegisterPlayerCommand } from '../commands';
import { PlayerRegistered } from '../events';

describe('registerHandler', () => {
    
    it('non-admin users are not allowed to issue the register command', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        const out = registerHandler({ user_name: 'akash.kurdekar', text: 'newUser' }, fakeEventStore, ["clarkkent"])
        const expected = `You are not authorised to register a new user. Please ask clarkkent`
        equal(out, expected)
    })

    it('admin users are allowed to issue the register command', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        const out = registerHandler({ user_name: 'akash.kurdekar', text: 'register newUser' }, fakeEventStore, ["akash.kurdekar"])
        const expected = `newuser registered`
        equal(out, expected)
    })

    it('username needs to be supplied', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))        
        const actual = registerHandler({ user_name: 'akash.kurdekar', text: 'register'}, fakeEventStore, ["akash.kurdekar"])
        const expectedSnippet = 'Wrong format'
        ok(actual.includes(expectedSnippet))
        equal(fakeEventStore.GetAllEvents().length, 0, 'expected event list to not change')
    })

    it('check if user already registered', () => {
        const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
        fakeEventStore.AddEvents([new PlayerRegistered('bob')])

        const actual = registerHandler({user_name: 'akash', text: 'register bob'}, fakeEventStore, ['akash'])
        const expectedSnippet = "already registered"
        ok(actual.includes(expectedSnippet))
        equal(fakeEventStore.GetAllEvents().length, 1, 'expected event list to not change')
    })
})