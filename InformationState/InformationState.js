var isu = require("./InformationStateSQLiteUtils");
var events = require("events");
var personality = require("../Personality/Personality");
var Util = require("../Utils/Utils.js");

var InformationState = function(allTheInfo){

	var self = this;
	var gotStuff = { 'personalitySet' : false };
	var utils = new Util();
	
	this.isUtils = new isu();
	
	this.allBooks = allTheInfo.allBooks;
	this.allAuthors = allTheInfo.allAuthors;
	this.allGenres = allTheInfo.allGenres;
	this.emitter = new events.EventEmitter();
	
	/* Stuff that will be populated only by the Dialogue Manager - but should technically belong in the Information Sate */
	this.prevBook = "";
	this.bookSimilarBy = "";
	
	this.personality = {};
	this.currentBook = {};
	this.currentAuthor = {};
	this.currentGenre = {};
	
	this.getEmitter = function(){
		return self.emitter;
	};
	
	var computeReviewClasses = function(){
		
		self.currentBook.positiveReviews = computePositiveReviews();
		self.currentBook.negativeReviews = computeNegativeReviews();
		self.currentBook.neutralReviews = computeNeutralReviews();
		
	};
	
	this.emitter.once('personalitySet', utils.generateFunctionToWaitOnEvent(this.emitter, gotStuff, 'personalitySet', 'initialized'));
	var setupPersonality = function(){
		self.personality = new personality(self.allBooks);
		self.emitter.emit('personalitySet');
	};
	
	setupPersonality();
	
	this.currentBook = {};
	this.prevUtteranceInfo = {};
	
	this.getCurrentBook = function(){
		return self.currentBook;
	};
	
	this.getBooksSimilarToCurrentBook = function(){
		return self.currentBook.similarBooks;
	};
	
	this.getReviewsOfCurrentBook = function(){
		return self.currentBook.reviews;
	};
	
	this.getBookSummary = function(){
		return self.currentBook.summary;
	};
	
	this.getAllBooks = function(){
		return self.allBooks;
	};
	
	this.getAllAuthors = function(){
		return self.allAuthors;
	};
	
	this.getAllGenres = function(){
		return self.allGenres;
	};
	
	var computePositiveReviews = function(){
		
		var positiveReviews = [];
		self.currentBook.reviews.forEach(function(review){
			if(review.starRating > 3){
				positiveReviews.push(review);
			}
		});
		
		return positiveReviews;
		
	};
	
	var computeNegativeReviews = function(){
		
		var negativeReviews = [];
		self.currentBook.reviews.forEach(function(review){
			if(review.starRating < 3){
				negativeReviews.push(review);
			}
		});
		
		return negativeReviews;
		
	};
	
	var computeNeutralReviews = function(){
		
		var neutralReviews = [];
		self.currentBook.reviews.forEach(function(review){
			if(review.starRating === 3){
				neutralReviews.push(review);
			}
		});
		
		return neutralReviews;
		
	};
	
	this.setCurrentGenre = function(genre){
		self.currentGenre = {
				'genre' : genre,
				'booksByGenre' : []
		};
		
		var gotData = {'gotBooksByGenre' : false};
		
		self.emitter.once('gotBooksByGenre', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotBooksByGenre', 'gotGenreData'));
		
		var tellOutsideWorldWereDone = function(){
			self.emitter.emit('genreChanged');
		};
		self.emitter.once('gotGenreData', tellOutsideWorldWereDone);
		console.log("Getting books by Genre");
		self.isUtils.getBooksByGenre(genre, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentGenre.booksByGenre, 'gotBooksByGenre'));
	};
	
	this.setCurrentAuthor = function(author){
		self.currentAuthor = {
				'author' : author,
				'booksByAuthor' : []
		};
		
		var gotData = {'gotBooksByAuthor' : false};
		
		self.emitter.once('gotBooksByAuthor', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotBooksByAuthor', 'gotAuthorData'));
		
		var tellOutsideWorldWereDone = function(){
			self.emitter.emit('authorChanged');
		};
		self.emitter.once('gotAuthorData',tellOutsideWorldWereDone);
		
		self.isUtils.getAllBooksByAuthor(author.name, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentAuthor.booksByAuthor, 'gotBooksByAuthor'));
	};
	
	this.setCurrentBook = function(book){
		
		var gotData = { 'gotReviews' : false, 'gotSimilarBooks' : false, 'gotAuthorBooks' : false, 'gotGenreBooks' : false, 'computedReadStatus' : false };
		
		var processSimilarBooks = function(){
			Object.keys(self.currentBook.allSimilarBooks).forEach(function(key){
				console.log("Testing whether the book is in list of " + key);
				self.currentBook.allSimilarBooks[key].forEach(function(book){
					if(book.asin === self.currentBook.book.asin){
						console.log("Found same book so deleting it ");
						self.currentBook.allSimilarBooks[key].splice(self.currentBook.allSimilarBooks[key].indexOf(book),1);
						console.log("Final list after deleting is ");
						console.log(self.currentBook.allSimilarBooks[key]);
					}
				});
				if(self.currentBook.allSimilarBooks[key].length === 0){
					console.log("Found a list of length 0 " + key);
					delete self.currentBook.allSimilarBooks[key];
				}
			});
			
			if(Object.keys(self.currentBook.allSimilarBooks).length === 0){
				self.currentBook.allSimilarBooks.favourites = self.personality.favouriteBooks;
			}
		};
		
		var tellOutsideWorldWeDone = function(){
			console.log("Telling the outside world that book changed");
			self.emitter.emit('bookChanged');
		};
		
		self.emitter.once('gotReviews', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotReviews', 'gotData'));
		self.emitter.once('gotSimilarBooks', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotSimilarBooks', 'gotData'));
		self.emitter.once('gotAuthorBooks', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotAuthorBooks', 'gotData'));
		self.emitter.once('gotGenreBooks', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'gotGenreBooks', 'gotData'));
		self.emitter.once('computedReadStatus', utils.generateFunctionToWaitOnEvent(self.emitter, gotData, 'computedReadStatus', 'gotData'));
		self.emitter.once('gotReviews', tellOutsideWorldWeDone);
		self.emitter.once('gotData', processSimilarBooks);
		
		var computeReadStatus = function(){
			
			if(book.summaryRating <= 0 || self.currentBook.reviews.length <= 1){
				self.currentBook.systemRead = false;
				self.currentBook.systemOpinion = "Unsure";
			}
			else{
				self.currentBook.systemRead = true;
			}
			self.emitter.emit('computedReadStatus');
		};
		
		self.emitter.once('gotReviews', computeReadStatus);
		
		/* Reset current book */
		self.currentBook = {
				summary: {
					summaryValue : -1,
					summaryName : ""
				},
				reviews: [],
				title: "",
				asin: "",
				systemOpinion : "",
				userInterest : 100,
				numberOfUtterances : 0,
				positiveReviews : [],
				negativeReviews : [],
				neutralReviews : [],
				systemRead : false,
				bookInFavourites : false,
				authorInFavourites : false,
				genreInFavourites : false,
				book : book,
				allSimilarBooks : {
					'readership' : [],
					'author' : [],
					'genre' : []
				}
		};
		
		self.currentBook.similarBooks = [];
		self.currentBook.reviews = [];
		self.currentBook.asin = book.asin;
		self.currentBook.title = book.title;
	
		var randomNum = utils.randomize(2);
		
		if(randomNum === 0){
			self.currentBook.systemOpinion = "Liked";
		}
		else {
			self.currentBook.systemOpinion = "Disliked";
		}
		
		self.isUtils.getAllReviewsForAsin(book.asin, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentBook.reviews, 'gotReviews', computeReviewClasses));
		self.isUtils.getBooksSimilarToAsin(book.asin, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentBook.allSimilarBooks.readership, 'gotSimilarBooks'));
		self.isUtils.getAllBooksByAuthor(book.authorName, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentBook.allSimilarBooks.author, 'gotAuthorBooks'));
		self.isUtils.getBooksByGenre(book.genre, utils.generateCallBackForSQLiteQueryProcessing(self.emitter, self.currentBook.allSimilarBooks.genre, 'gotGenreBooks'));

		var computeSummary = function(){
			
			console.log("Computed summary");
			self.currentBook.summary = book.summaryRating;

			if( self.currentBook.summary.summaryValue > 3 ){
				self.currentBook.summary.summaryName = "Liked";
			}
			else {
				self.currentBook.summary.summaryName = "Disliked";
			}
			
		};

		computeSummary();
	
		self.personality.favouriteBooks.forEach(function(book){
			if(self.currentBook.asin === book.asin){
				self.currentBook.systemOpinion = "Loved";
			}
		});

		self.currentBook.userInterest = 100;
		self.currentBook.numberOfUtterances = 0;
		
		var computeWhetherInAnyFavourites = function(){
			console.log("Computing whether the book is in favourites");
			self.personality.favouriteBooks.forEach(function(faveBook){
				if(faveBook.asin === book.asin){
					self.currentBook.bookInFavourites = true;
				}
			});
			
			self.personality.favouriteAuthors.forEach(function(faveAuthor){
				if(faveAuthor === book.authorName){
					self.currentBook.authorInFavourites = true;
				}
			});
			
			var bookGenreList = book.genre.split(":");
			self.personality.favouriteGenres.forEach(function(faveGenre){
				bookGenreList.forEach(function(bookGenre){
					if(faveGenre === bookGenre){
						self.currentBook.genreInFavourites = true;
					}
				});
			});
		};
		
		console.log("Completed calling change the book function");
		computeWhetherInAnyFavourites();
		
	};
	
	
};

module.exports = InformationState;
