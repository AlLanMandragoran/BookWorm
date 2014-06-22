var sqlite3 = require("sqlite3").verbose();

var SQLite3Utils = function(dbLoc){
	
	var self = this;
	this.db = new sqlite3.Database(dbLoc);
	
	this.getDB = function(){
		return self.db;
	};
	
	this.setDB = function(dbLocation){
		self.db = dbLocation;
	};
	
	this.executeSQLiteSelectQuery = function(query, callback){
		self.db.serialize(function(){
			var results = [];
			self.db.all(query, function(err, rows){
				if(err){
					console.log(err);
				}
				callback(err, rows);
			
			});
	
		});
	};
	
	this.executeSQLiteUpdateQuery = function(query, callback){
		self.db.serialize(function(){
			self.db.all(query, function(err, rows){
				if(err){
					console.log(err);
				}
				callback(err, rows);
				
			});
		});
	};
	
};

module.exports = SQLite3Utils;