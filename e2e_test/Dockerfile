FROM node:22-alpine
LABEL authors="akisalmi"

WORKDIR /workspace
COPY package.json tsconfig.json tsconfig.test.json yarn.lock ./

RUN yarn install --frozen-lockfile
COPY src ./src
COPY test ./test

EXPOSE 4200
CMD ["yarn", "test"]
