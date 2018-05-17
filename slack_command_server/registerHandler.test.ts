import { equal } from 'assert'
import { EventStore } from '../eventStore';
import { registerHandler } from './registerHandler';
import { InMemoryEventStoreRepo } from '../InMemoryEventStoreRepo';



describe('registerHandler', () => {
    describe('only admin users are allowed to issue this command', () => {
        it('unauthorised', () => {
            const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
            const out = registerHandler({ user_name: 'akash.kurdekar', text: 'newUser' }, fakeEventStore, ["clarkkent"])
            const expected = `You are not authorised to register a new user. Please ask clarkkent`
            equal(out, expected)
        })

        it('authorised', () => {
            const fakeEventStore = new EventStore(new InMemoryEventStoreRepo([]))
            const out = registerHandler({ user_name: 'akash.kurdekar', text: 'register newUser' }, fakeEventStore, ["akash.kurdekar"])
            const expected = `newuser registered`
            equal(out, expected)
        })
    })
})