var fs = require("fs");
var _ = require("lodash");
var ContainershipPlugin = require("containership.plugin");
var Container = require([__dirname, "lib", "container"].join("/"));

module.exports = new ContainershipPlugin({
    type: "cli",

    initialize: function(){
        var self = this;

        return {
            init: function(options){
                if(_.has(options, "container-id")){
                    var container = new Container({
                        application: options.application,
                        container_id: options["container-id"],
                        api_url: self.config["api-url"],
                        ssh_username: self.config["ssh-username"]
                    });

                    container.load(function(err){
                        if(err)
                            console.log(err.message);
                        else{
                            container.enter(function(err){
                                if(err)
                                    console.log(err);
                            });
                        }
                    });
                }
            },

            options: {
                application: {
                    position: 1,
                    help: "ContainerShip application name",
                    required: true
                },
                "container-id": {
                    help: "Application container ID",
                    required: true
                }
            },

            configure_options: {
                "ssh-username": {
                    help: "username used to ssh into ContainerShip hosts",
                    required: true
                }
            }
        }
    },

    reload: function(){}
});
