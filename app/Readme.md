
MVP plan: https://docs.google.com/spreadsheets/d/1gpZsIii90Fg5nfw3qW2eitaq8lhnZVD8LbWqlLLGpVg/edit#gid=0

# Run instructions

1. terminal window 1 - 

docker-compose up (make sure the container has been deleting if you changing the database)

2. terminal window 2 -

npm run start

### Known issues

1. Can create an account & progress without adding personal details 
    - maybe this is not an issue they can just be a username ?

2. hashedPassword / dateCreated is returned along with user data for many endpoints
    - BIG PROBLEM