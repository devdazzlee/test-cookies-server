# Use a lightweight Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Remove cache to avoid EBUSY errors
RUN rm -rf /app/node_modules/.cache

# Copy the rest of the app
COPY . .

# Expose port (Change if needed)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
