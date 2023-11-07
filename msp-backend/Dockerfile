FROM node:lts-alpine

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY .env .
COPY src/ ./src

EXPOSE 3000

RUN npm run build
CMD ["npm", "run", "start"]