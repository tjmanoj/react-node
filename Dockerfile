FROM node:13.12.0-alpine
WORKDIR /app
RUN chmod -R 777 /app/
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.0 -g --silent
COPY . ./
RUN chmod -R 777 /app/
EXPOSE 3000
CMD ["npm", "start"]

