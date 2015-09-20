# launcher
Remotely deploy docker containers via API - Currently, I'm working on this and please visit this project later.

#To build the image:
docker build -t mgireesh05/launcher .

#To run the image:
docker run -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock mgireesh05/launcher

#To launch containers:

E.g. 
	POST http://localhost:8000/launch_containers
	Body: 
		{"containersList" : [
    		{"containerName" : "ubuntu","containerVersionTag" : "latest"},
    		{"containerName" : "node","containerVersionTag" : "0-slim"}
		]}
