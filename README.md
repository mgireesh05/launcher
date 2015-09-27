# launcher
This demonstrates the usage of dockerode to remotely deploy docker containers. Feel free to add a comment or send a PR if you want more examples. 

# Get the image

- You may clone the git repo and build the image using the Dockerfile

```sh
$ docker build -t mgireesh05/launcher .
```

- Alternatively, you may pull the image from docker registry

```sh
$ docker pull mgireesh05/launcher
```

# Run the image
```sh
$ docker run -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock mgireesh05/launcher
```

# APIs

- /launch_containers

E.g. This API will 
- pull node:0-slim container
- start three instances and expose port 80 of each to 8001, 8002, and 8003 on the host
- mounts /tmp/mount on host to /mount in the container

``` 
POST http://localhost:8000/launch_containers

Content-Type : application/json

{
    "containersList" : [{
        "containerName" : "node",
        "containerVersionTag" : "0-slim",
        "envVarArray" :["key1=val1", "key2=val2", "key3=val3"],
        "containerMountPath" : "/mount",
        "hostMountPath" : "/tmp/mount",
        "containerPort" : "80/tcp",
        "hostPort" : "8001"
    },
    {
        "containerName" : "node",
        "containerVersionTag" : "0-slim",
        "envVarArray" :["key1=val1", "key2=val2", "key3=val3"],
        "containerMountPath" : "/mount",
        "hostMountPath" : "/tmp/mount",
        "containerPort" : "80/tcp",
        "hostPort" : "8002"
    },    
    {
        "containerName" : "node",
        "containerVersionTag" : "0-slim",
        "envVarArray" :["key1=val1", "key2=val2", "key3=val3"],
        "containerMountPath" : "/mount",
        "hostMountPath" : "/tmp/mount",
        "containerPort" : "80/tcp",
        "hostPort" : "8003"
    }]
}
```

License
----

MIT