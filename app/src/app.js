var express = require('express');
var bodyParser = require('body-parser');
var Launcher = require('./launcher');
var launcher = new Launcher();

var app = new express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: false
}));

app.post('/launch_containers', function(req, resp) {
	if (!req.body || !req.body.containersList) {
		return resp.status(400).send("Send a list of containers");
	}
	resp.status(200).send("List received");
	launcher.launchContainers(req.body.containersList);
});

app.listen(8000);