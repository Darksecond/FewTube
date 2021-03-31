# Fewtube

This replaces YouTube as a frontend. It still uses youtube as the actual data source, and it does not download any videos.

The easiest way to run this is to run the docker container, after building the image you can run a command like:

```
docker run -d --name=fewtube --restart=unless-stopped -v ./data:/data fewtube:latest
```