set -e

if [ ! -f ./event-store.json ]; then
    echo "event-store.json not found. Copying from ./testData/testEventStore.json"
    cp ./testData/testEventStore.json ./event-store.json
fi

yarn
PORT=2222 EVENT_STORE_FILE_PATH=./event-store.json npm start


