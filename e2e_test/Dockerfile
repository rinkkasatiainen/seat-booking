FROM node:20-alpine as build
LABEL authors="akisalmi"

RUN rm -rf /workspace
RUN mkdir -p /workspace
WORKDIR /workspace
COPY package.json tsconfig.json tsconfig.test.json yarn.lock ./

# build the service with TSC
RUN yarn install
COPY src ./src

FROM build as DEV
#COPY variables.env.example ./variables.env
#COPY dist ./dist
#COPY --from=build dist ./dist
EXPOSE 4000
CMD yarn test
