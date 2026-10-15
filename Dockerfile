FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY index.html .nojekyll ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY server ./server
RUN node scripts/build.mjs
ENV HOST=0.0.0.0 PORT=8080 SERVE_DIST=1 COUNTER_DB=/data/players.sqlite
VOLUME /data
EXPOSE 8080
CMD ["node","scripts/serve.mjs"]
