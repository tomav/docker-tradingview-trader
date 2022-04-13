FROM node:17-alpine
RUN apk update && apk upgrade && apk add --no-cache git
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
CMD ["node","index.js"]
