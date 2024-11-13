# use the official Node.js image as our base
FROM node:18

# set the working directory inside the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json first to leverage docker cache
COPY package*.json ./

# install app dependencies
RUN npm install

# copy the rest of app's source code into the container 
COPY . .

# expose the port
EXPOSE 5501

# command to run our app
CMD ["npm", "run", "dev"]