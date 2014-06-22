var sqlite = require("../SQLite/SQLiteUtils");

var db = new sqlite("D:\\Linux Wala Dropbox\\BookWorm");

var InformationStateSQLiteUtils = function(){
	
	this.getAllBooks = function(callback){
		db.executeSQLiteSelectQuery("select * from book_authorname", callback);
	};
	
	this.getAllAuthors = function(callback){
		db.executeSQLiteSelectQuery("select * from author_summary", callback);
	};
	
	this.getAllGenres = function(callback){
		db.executeSQLiteSelectQuery("select distinct genre from book where genre <> 'Nothing Really'", callback);
	};
	
	this.getBooksSimilarToAsin = function(asin, callback){
		db.executeSQLiteSelectQuery("select b.* from similar a left join book_authorname b on a.similarAsin = b.asin where a.asin = '" + asin + "'", callback);
	};
	
	this.getAllReviewsForAsin = function(asin, callback){
		db.executeSQLiteSelectQuery("select * from review where book = '" + asin + "' and starRating <> -1" , callback);
	};
	
	this.getAllReviewsForAsinOfRating = function(asin, starRating, callback){
		db.executeSQLiteSelectQuery("select * from review where book = '" + asin + "' and starRating = " + starRating , callback);
	};
	
	this.getAllBooksByAuthor = function(authorName, callback){
		db.executeSQLiteSelectQuery("select * from book_authorname where lower(authorName) = lower('" + authorName + "')", callback);
	};
	
	this.getBooksByGenre = function(genre, callback){
		var genreList = genre.split(":");
		console.log(genreList);
		genreList.forEach(function(genre){
			console.log("Figuring out if " + genre + " needs to be removed from list");
			if(genre.toLowerCase().match('kindle') || genre.toLowerCase().match('ebook') 
					|| genre.toLowerCase().match('e book') || genre.toLowerCase().match('e-book')
					|| genre.toLowerCase().match('other')){
				console.log("Turns out " + genre + " does need to be removed");
				genreList.splice(genreList.indexOf(genre), 1);
			}
		});
		
		console.log("genre list after deleting the common ones now is " + genreList);
		if(genreList.length > 0){
			var query = "select * from book_authorname where genre like '%" + genreList[0] + "%'";
			for(var i = 1; i<genreList.length; i++){
				query = query + " union " + "select * from book_authorname where genre like '%" + genreList[i] + "%'";
			}
			query = query + " limit 20";
			db.executeSQLiteSelectQuery(query, callback);
		}
		else{
			callback(undefined, []);
		}
	};
	
};


module.exports = InformationStateSQLiteUtils;