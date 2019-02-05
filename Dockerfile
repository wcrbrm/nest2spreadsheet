FROM node:11-alpine

WORKDIR /usr/src/app
COPY . ./
RUN npm install --only=production
ENV DEBUG=*,-follow-redirects

EXPOSE 3000

CMD [ "npm", "run", "watch" ]
