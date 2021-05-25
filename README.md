# LectureService

## Development

```
docker run -it -v <<PROJECT PATH>>:/app -w /app -e PORT=3001 -p3001:3001 node:16-alpine npm run dev
```

## Building the Image

```
docker build -t "campus-compact/lecture-service" .
```

