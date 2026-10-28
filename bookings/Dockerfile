FROM node:22-alpine AS build
LABEL authors="akisalmi"

WORKDIR /workspace
COPY package.json tsconfig.json nodemon.json yarn.lock ./

RUN yarn install --frozen-lockfile
COPY src ./src
RUN yarn build

FROM build AS DEV
COPY variables.env.example ./variables.env
EXPOSE 4100
# tsc --watch writes into the mounted dist folder, then nodemon restarts.
CMD ["yarn", "start:dev"]

# Install only production dependencies & remove dev dependencies
FROM build AS PROD
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production
COPY variables.env.example ./variables.env
EXPOSE 4100
CMD ["node", "dist/src/app.js"]
