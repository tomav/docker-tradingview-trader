FROM node:17-alpine
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm i
CMD ["node","index.js"]
