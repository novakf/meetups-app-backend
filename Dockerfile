FROM node:19-alpine
EXPOSE 3001
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . /app/
CMD ["npm", "run", "start:dev"]
