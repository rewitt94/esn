
MVP plan: https://docs.google.com/spreadsheets/d/1gpZsIii90Fg5nfw3qW2eitaq8lhnZVD8LbWqlLLGpVg/edit#gid=0

## Requirements

- docker
- node

## Run instructions

Setup:

- npm install

To run server:

- docker-compose up -d
- npm run start

To access postgres on cli:

- npm run psql

## Dev configuration

create .env file

```
POSTGRES_USER = app
POSTGRES_PASSWORD = abc123$%^
POSTGRES_DB = directo
TYPEORM_CONNECTION = postgres
TYPEORM_HOST = localhost
TYPEORM_USERNAME = app
TYPEORM_PASSWORD = abc123$%^
TYPEORM_DATABASE = directo
TYPEORM_PORT = 5432
TYPEORM_SYNCHRONIZE = true
TYPEORM_LOGGING = false
TYPEORM_ENTITIES = dist/src/entities/*.js
JWT_SECRET = a763asvi££l3%%b
WEB_APP_PORT = 3000
```

## Tech debt

- Unit tests
- Replace moment with luxon
- ESLINT for BE app

## MVP features

- Addresses for events
- Posts for communities and events
- Replace username with (???)
- Add email or mobile (verified) and reset password journey

## Currently out of scope features

- Scan QR code to add friends
- Profile pictures
- Suggested event times & condition attendance / polls
- Desk booking system for offices
