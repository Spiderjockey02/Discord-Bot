FROM node:16.13.2

# Create the directory!
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json ./
RUN npm install && npm cache clean --force

# Our precious bot
COPY . /usr/src/bot

# Start me!
CMD ["node", "src/index.js"]
