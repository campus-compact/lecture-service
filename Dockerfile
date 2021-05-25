FROM node:16-alpine
WORKDIR /app

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "prod"]
