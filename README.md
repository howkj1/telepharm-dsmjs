## Getting Set Up
* npm i
* Configure a postgres database to match the configuration in your `.env` file

If you have docker you can just 

docker run --name postgres -e POSTGRES_PASSWORD=dsmjs -d dsmjs

## Running the Tests

* `npm test` (or mocha configuration in WebStorm)
* `npm run coverage` for a local coverage report

## Environment Variables (create .env file in project root)
```
DSM_CDN=//localhost:8003/lib
DSM_URL=localhost
DSM_PORT=8002
DSM_PG_USERNAME=dsmjs
DSM_PG_DATABASE=dsmjs
DSM_PG_PASSWORD=dsmjs
DSM_PG_PORT=5432
DSM_PG_URL=127.0.0.1
```

## Running the stack locally

* `npm run dev-server`
* `npm run dev-client`
* navigate to `localhost:8002` in your browser
