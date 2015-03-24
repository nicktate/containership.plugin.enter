var request = require("request");
var child_process = require("child_process");

function Container(options){
    this.options = options;
}

Container.prototype.load = function(fn){
    var self = this;

    var options = {
        url: [this.options.api_url, "v1", "applications", this.options.application, "containers", this.options.container_id].join("/"),
        method: "GET",
        json: true
    }

    request(options, function(err, response){
        if(err)
            return fn(err);
        else if(response.statusCode != 200)
            return fn(new Error("Error fetching container information. Does the container exist?"));
        else{
            self.configuration = response.body;
            return fn();
        }
    });
}

Container.prototype.enter = function(fn){
    var self = this;

    var options = {
        url: [this.options.api_url, "v1", "hosts", this.configuration.host].join("/"),
        method: "GET",
        json: true

    }

    request(options, function(err, response){
        if(err)
            return fn(err);
        else if(response.statusCode != 200)
            return fn(new Error("Error fetching host information"));
        else{
            var username = self.options.ssh_username || process.env.USER;
            child_process.spawn("ssh", [
                "-t",
                [username, response.body.address.private].join("@"),
                "sudo docker exec -it",
                [self.options.application, self.configuration.id].join("-"),
                "/bin/bash"
            ], {
                stdio: "inherit"
            });
        }
    });
}

module.exports = Container;
