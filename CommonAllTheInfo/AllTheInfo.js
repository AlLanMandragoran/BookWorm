var sqliteUtils = require("../InformationState/InformationStateSQLiteUtils");
var events = require('events');
var Util = require('../Utils/Utils');

var AllTheInfo = function(){
	
	var sqlite = new sqliteUtils();
	var self = this;
	var utils = new Util();
	
	this.allBooks = [];
	this.allAuthors = [];
	this.allGenres = [];
	this.emitter = new events.EventEmitter();
	
	var gotStuff = { 'gotBooks' : false, 'gotAuthors' : false, 'gotGenres' : false };
	var rawGenres = [];
	this.emitter.once('gotBooks', utils.generateFunctionToWaitOnEvent(this.emitter, gotStuff, 'gotBooks', 'initialized'));
	this.emitter.once('gotAuthors', utils.generateFunctionToWaitOnEvent(this.emitter, gotStuff, 'gotAuthors', 'initialized'));
	this.emitter.once('gotGenres', utils.generateFunctionToWaitOnEvent(this.emitter, gotStuff, 'gotGenres', 'initialized'));
	
	var getDistinctGenres = function(){
		
		var onlyUnique = function(value, index, array){
			return array.indexOf(value) === index;
		};
		
		var genresWithDuplicates = [];
		rawGenres.forEach(function(genreSet){
			var genreList = genreSet.genre.split(':');
			genreList.forEach(function(genre){
				genresWithDuplicates.push(genre);
			});
		});
		
		self.allGenres = genresWithDuplicates.filter(onlyUnique);
		self.emitter.emit('gotGenres');
		
	};
	
	sqlite.getAllBooks(utils.generateCallBackForSQLiteQueryProcessing(this.emitter, self.allBooks, 'gotBooks'));
	sqlite.getAllAuthors(utils.generateCallBackForSQLiteQueryProcessing(this.emitter, self.allAuthors, 'gotAuthors'));
	sqlite.getAllGenres(utils.generateCallBackForSQLiteQueryProcessing(this.emitter, rawGenres, 'retrievedGenres', getDistinctGenres));
	
};

module.exports = AllTheInfo;