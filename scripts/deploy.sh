#!/bin/bash

# Exit on any error
set -e

pnpm wrangler pages publish ./public --project-name=remix-cloudflare-clickhouse --skip-caching
