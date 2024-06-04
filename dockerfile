# Use Node 18 Alpine as the base image
FROM node:18-alpine

# Install Python and build tools
RUN apk add --no-cache python3 py3-pip build-base

# Create a symbolic link for python
RUN ln -sf python3 /usr/bin/python

# Set the working directory to /app inside the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml from your Next.js app folder into the Docker image
COPY ./package*.json ./pnpm-lock*.yaml ./

# Install dependencies using pnpm
RUN npm install -g pnpm && pnpm install

# Copy the rest of your app from your Next.js app folder into the Docker image
COPY . ./

# Build the Next.js application
# RUN pnpm run build

# The command to start your app
CMD ["pnpm", "dev"]

# Optional: expose port 3000 to be accessible from the host
EXPOSE 3000
