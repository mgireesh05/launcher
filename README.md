# launcher
Remotely deploy docker containers via API - Currently, I'm working on this and please visit this project later.

# Get the image

- You may clone the git repo and build the image using the Dockerfile

```sh
$ docker build -t mgireesh05/launcher .
```

- Pull the image from docker registry

```sh
$ docker pull mgireesh05/launcher
```

# Run the image
```sh
$ docker run -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock mgireesh05/launcher
```

# APIs

- /launch_containers

E.g. this will pull ubuntu:latest and node:0-slim images from the docker repository

``` 
POST http://localhost:8000/launch_containers

Content-Type : application/json

{"containersList" : [
	{"containerName" : "ubuntu","containerVersionTag" : "latest"},
	{"containerName" : "node","containerVersionTag" : "0-slim"}
]}
```

License
----

MIT