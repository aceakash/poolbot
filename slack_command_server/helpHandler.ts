export function helpHandler(): string {
     return `Valid commands are:
\`/pool help\`: show this help message
\`/pool table\`: see a simple ratings table
\`/pool ratings\`: see an extended ratings table
\`/pool result <winner> <loser>\`: add a result
\`/pool h2h <player_name>\`: see player's head-to-head stats vs everyone else
\`/pool log\`: see the most recently played games
\`/pool log <user_name>\`: see a user's most recently played games`
}