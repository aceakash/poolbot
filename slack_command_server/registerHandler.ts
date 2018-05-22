import { EventStore } from "../eventStore";
import { sanitiseUserName } from "./helpers";
import { RegisterPlayerCommand, PlayerAlreadyRegisteredError } from "../commands";

export function registerHandler(query: any, eventStore: EventStore, adminUsers: string[]): string {
    const isAdmin = adminUsers.includes(sanitiseUserName(query.user_name))
    if (!isAdmin) {
        return "You are not authorised to register a new user. Please ask " + adminUsers.join(" or ")
    }
    const parts = query.text.split(" ")
    if (parts.length !== 2) {
        return "Wrong format. Use `/pool register <user_name>`"
    }
    const newPlayer = sanitiseUserName(parts[1])
    const events = eventStore.Decide(new RegisterPlayerCommand(newPlayer))
    if (events === PlayerAlreadyRegisteredError) {
        return `${newPlayer} is already registered.`
    }
    if (events instanceof Error) {
        return `Oops, something went wrong. Please try again later.`
    }
    eventStore.AddEvents(events)
    return `${newPlayer} registered`
}