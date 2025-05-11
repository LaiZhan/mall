FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*
RUN npm install -g @vue/cli && npm cache clean --force