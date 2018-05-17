Poolbot is a Slack bot for setting up a pool ladder for Slack members.

Stores data in a local JSON file, whose path needs to be provided as an environment variable `EVENT_STORE_FILE_PATH`. Feel free to use the provided `testData/testEventStore.json` for some test data.

To run with Docker:

```
docker build -t poolbot .
docker run -it -e "PORT:2222" -p "2222:2222" --name poolbot  -v ${pwd}/event-store.json:/app/event-store.json poolbot
```

If you have Node.js installed, just run `./local-dev.sh`