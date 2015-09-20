# launcher
Remotely deploy docker containers via API - Currently, I'm working on this and please visit this project later.

# Build the image
```
docker build -t mgireesh05/launcher .
```

# Run the image
```
docker run -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock mgireesh05/launcher
```

# Launch containers
``` 
	POST http://localhost:8000/launch_containers

	Content-Type : application/json

	{"containersList" : [
		{"containerName" : "ubuntu","containerVersionTag" : "latest"},
		{"containerName" : "node","containerVersionTag" : "0-slim"}
	]}
```
