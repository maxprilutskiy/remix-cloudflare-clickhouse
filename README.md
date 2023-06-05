# Cloudflare Edge (via Remix js framework) / Clickhouse demo

This is a demo of a simple web app that uses Cloudflare Workers to serve a static site and a Clickhouse database. The app is built using the [Remix](https://remix.run) framework.

This app demonstrate the issue, when the Clickhouse database is not accessible from the Cloudflare Edge but only the one that is hosted on DoubleCloud (Clickhouse com one works just fine).

## Prerequisites

Check the `app/routes/api.track.ts` file to see what the query looks like, and create a table in the database with the needed schema. Or, modify the query to match your table.

## How to run (locally)

```bash
pnpm i # to install all the deps
```

Copy .example.dev.vars to .dev.vars and fill in the env vars to use from inside the app.

```bash
cp .example.dev.vars .dev.vars
```

Run the app

```bash
pnpm dev
```

Make a request to the app

```bash
open http://127.0.0.1:8778/api/track
```

Observe the following warnings in the console:

```
WARNING: known issue with `fetch()` requests to custom HTTPS ports in published Workers:
 - https://XYZ.aws.clickhouse.cloud:8443/ - the custom port will be ignored when the Worker is published using the `wrangler publish` command.

WARNING: known issue with `fetch()` requests to custom HTTPS ports in published Workers:
 - https://rw.XYZ.at.double.cloud:8443/ - the custom port will be ignored when the Worker is published using the `wrangler publish` command.
```

## How to deploy to cloudflare

```bash
pnpm deploy # uses wrangler to deploy the app, make sure you're logged in
```

After deploying, make a request to the deployed app's endpoint `/api/track`. The request to DoubleCloud will fail, but the one to Clickhouse com will not and the data will be saved to the database.
