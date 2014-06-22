var neo4j = require("../Neo4j/Neo4jUtilities");
var async = require("async");

//TODO: Replace with info from config file
var neo = new neo4j("http://localhost:7474");

var InformationStateUtils = function(){

	this.getAllBooks = function(callback){
		neo.executeCypherQuery("MATCH (bk:Book) RETURN bk", callback);
	};
	
	this.getAllAuthors = function(callback){
		//TODO: Fill in right query to get all authors (Create all author nodes in neo4j First)
		var err;
		var results = [ {'au' : {'name' : 'J.K. Rowling'} } , {'au' : {'name' : 'Roberto Bolano'} } ];
		callback(err, results);
	};
	
	this.getBooksSimilarToAsin = function(asin, callback){
		var query = "MATCH (bk1:Book) WHERE bk1.asin = '" + asin + "' MATCH (bk2:Book) MATCH (bk1)-[r:IS_SIMILAR_TO]-(bk2) RETURN bk2";
		neo.executeCypherQuery(query, callback);
	};
	
	this.getReviewsForAsin = function(asin, starRating, callback){
		var query = "MATCH (bk:Book) WHERE bk.asin = '" + asin + "' MATCH (bk)-[r:HAS_REVIEW {starRating:" + starRating + "}]-(rw:Review) RETURN rw";
		neo.executeCypherQuery(query, callback);
	};
	
	this.getAllReviewsForAsin = function(asin, callback){
		var query = "MATCH (bk:Book) WHERE bk.asin = '" + asin + "' MATCH (bk)-[r:HAS_REVIEW]-(rw:Review) RETURN rw";
		neo.executeCypherQuery(query, callback);
	};
	
	this.getSummaryNodeForAsin = function(asin, callback){
		var query = "MATCH (bk:Book) WHERE bk.asin = '" + asin + "' MATCH (bk)-[S:HAS_SUMMARY]-(s:Summary) RETURN s";
		neo.executeCypherQuery(query, callback);
	};

};


module.exports = InformationStateUtils;
