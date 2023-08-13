FROM node:20-alpine
LABEL authors="akisalmi"

RUN mkdir -p /workspace
WORKDIR /workspace
COPY package.json tsconfig.json nodemon.json ./
RUN yarn install

COPY src ./src
RUN yarn build
COPY dist ./dist
COPY variables.env.example ./variables.env
EXPOSE 4000
CMD yarn nodemon

