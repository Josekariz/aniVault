# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose the port that Next.js will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]
