FROM node:15

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
VOLUME /data
WORKDIR /data
CMD [ "node", "/app/src/main.mjs" ]