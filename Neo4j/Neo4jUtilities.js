var neo4j = require("neo4j");

function Neo4jUtils(dbLoc){
	
	var self = this;
	this.db = new neo4j.GraphDatabase(dbLoc);
	
	this.setDB = function(dbLocation){
		self.db = dbLocation;
	};
	
	this.getDB = function(){
		return self.db;
	};
	
	this.executeCypherQuery = function(queryToExec, callback){
		self.db.query(queryToExec, {}, function(err, results){
			callback(err, results);
		});
	};
}

module.exports = Neo4jUtils;