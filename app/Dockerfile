# First stage: compile things.
FROM node:15.4.0-alpine3.10 AS build
WORKDIR /usr/src/app

# (Install OS dependencies; include -dev packages if needed.)

# Install the Javascript dependencies, including all devDependencies.
COPY package.json .
RUN npm install

# Copy the rest of the application in and build it.
COPY . .
# RUN npm build
RUN npm run build

# Now /usr/src/app/dist has the built files.

# Second stage: run things.
FROM node:15.4.0-alpine3.10
WORKDIR /usr/src/app

ARG environment=./env/dev

# (Install OS dependencies; just libraries.)

# Install the Javascript dependencies, only runtime libraries.
COPY package.json .
COPY $environment .env
RUN npm install --production

# Copy the dist tree from the first stage.
COPY --from=build /usr/src/app/dist dist

# Run the built application when the container starts.
EXPOSE 3000
CMD ["node", "."]