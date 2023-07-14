FROM node:16.9.1-alpine3.14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm install pm2 -g

EXPOSE 3000
CMD ["pm2-runtime", "index.js"]