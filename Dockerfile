FROM node:11

WORKDIR /usr/src/app
COPY package*.json src ./
RUN npm install --only=production

CMD [ "npm", "watch" ]