FROM node:25-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Explicitly copy only application source code and configs (avoids host node_modules/.env/git)
COPY tsconfig.json swagger.ts ./
COPY src/ ./src/

# Expose port 3000
EXPOSE 3000

# Run the TypeScript application
CMD ["node", "src/app.ts"]
