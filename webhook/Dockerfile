
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g

# Copy the rest of the application files into the container
COPY . .

# Expose the application port (make sure this matches your app's port)
EXPOSE 3500

# Start the app using PM2 in production mode
CMD ["pm2-runtime", "index.js", "--name", "webhookBackend-pm2", "--env", "production"]

