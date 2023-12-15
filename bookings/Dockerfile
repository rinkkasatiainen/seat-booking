FROM node:20-alpine as build
LABEL authors="akisalmi"

RUN rm -rf /workspace
RUN mkdir -p /workspace
WORKDIR /workspace
COPY package.json tsconfig.json nodemon.json yarn.lock ./

# build the service with TSC
RUN yarn install
COPY src ./src

FROM build as DEV
COPY variables.env.example ./variables.env
COPY dist ./dist
#COPY --from=build dist ./dist
EXPOSE 4100
CMD yarn nodemon

# Install only production dependencies & remove dev dependencies
FROM build as PROD

RUN yarn build
COPY  dist ./dist
ENV NODE_ENV=production
RUN yarn install --production
COPY variables.env.example ./variables.env
EXPOSE 4100
CMD node dist/src/app.js


