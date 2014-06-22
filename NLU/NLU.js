var sentiment = require("sentiment");
var natural = require("natural");
var Classifier = require("../Classifier/Classifier");

var NLU = function(is){
	
	var self = this;
	
	var classifier = new Classifier();
	classifier.train();
	
	var informationState = is;
	var allTheBooks = is.getAllBooks();
	var allTheAuthors = is.getAllAuthors();
	var allTheGenres = is.getAllGenres();
	
	var getMostLikelyBooksInUtterance = function(utterance, processedUtterance){
		
		var likelyBooks = {
				'one' : {},
				'two' : {}
		};
		
		processedUtterance.books = likelyBooks;
	
		var first = natural.DiceCoefficient(utterance, allTheBooks[0].title);
		var second = natural.DiceCoefficient(utterance, allTheBooks[1].title);
		
		if(first > second){
			likelyBooks.one = {value: first, book: allTheBooks[0]};
			likelyBooks.two = {value: second, book: allTheBooks[1]};
		}
		else{
			likelyBooks.one = {value: second, book: allTheBooks[1]};
			likelyBooks.two = {value: first, book: allTheBooks[0]};
		}
		
		allTheBooks.forEach(function(book){
			
			var match = natural.DiceCoefficient(utterance, book.title);
			if(match > likelyBooks.one.value){
				likelyBooks.two.value = likelyBooks.one.value;
				likelyBooks.two.book = likelyBooks.one.book;
				likelyBooks.one.value = match;
				likelyBooks.one.book = book;
			}
			
		});
		
	};
	
	var getMostLikelyAuthorsInUtterance = function(utterance, processedUtterance){
		
		var mySelf = this;
		this.understoodUtterance = processedUtterance;
		
		var likelyAuthors = {
				'one' : {},
				'two' : {}
		};
		
		processedUtterance.authors = likelyAuthors;
		
		var first = natural.DiceCoefficient(utterance, allTheAuthors[0].name);
		var second = natural.DiceCoefficient(utterance, allTheAuthors[1].name);
		
		if(first > second){
			likelyAuthors.one = {value: first, author: allTheAuthors[0]};
			likelyAuthors.two = {value: second, author: allTheAuthors[1]};
		}
		else{
			likelyAuthors.one = {value: second, author: allTheAuthors[1]};
			likelyAuthors.two = {value: first, author: allTheAuthors[0]};
		}
		
		allTheAuthors.forEach(function(author){
			
			var match = natural.DiceCoefficient(utterance, author.name);
			if(match > likelyAuthors.one.value){
				likelyAuthors.two.value = likelyAuthors.one.value;
				likelyAuthors.two.author = likelyAuthors.one.author;
				likelyAuthors.one.value = match;
				likelyAuthors.one.author = author;
			}
			
		});

	
	};
	
	var getMostLikelyGenresInUtterance = function(utterance, processedUtterance){
		var mySelf = this;
		
		this.understoodUtterance = processedUtterance;
		
		var likelyGenres = {
				'one' : {},
				'two' : {}
		};
		
		processedUtterance.genres = likelyGenres;

		var first = natural.DiceCoefficient(utterance, allTheGenres[0]);
		var second = natural.DiceCoefficient(utterance, allTheGenres[1]);
		
		if(first>second){
			likelyGenres.one = {value: first, genre: allTheGenres[0]};
			likelyGenres.two = {value: second, genre: allTheGenres[1]};
		}
		else{
			likelyGenres.one = {value: second, genre: allTheGenres[1]};
			likelyGenres.two = {value: first, genre: allTheGenres[0]};
		}
		
		allTheGenres.forEach(function(genre){
			
			var match = natural.DiceCoefficient(utterance, genre);
			if(match > likelyGenres.one.value){
				likelyGenres.two.value = likelyGenres.one.value;
				likelyGenres.two.genre = likelyGenres.one.genre;
				likelyGenres.one.value = match;
				likelyGenres.one.genre = genre;
			}
		});
	};
	
	var getMostLikelyNamedEntityInUtterance = function(likelyAuthors, likelyBooks, likelyGenres, processedUtterance){
		
		var max = likelyAuthors.one.value;
		var maxEntity = { 'type' : 'author', 'entity' : likelyAuthors.one.author, 'value' : max };
		
		if(likelyBooks.one.value > max){
			max = likelyBooks.one.value;
			maxEntity = { 'type' : 'book', 'entity' : likelyBooks.one.book, 'value' : max };
		}
		
		if(likelyGenres.one.value > max){
			max = likelyGenres.one.value;
			maxEntity = { 'type' : 'genre', 'entity' : likelyGenres.one.genre, 'value' : max };
		}
	
		processedUtterance.mostLikelyEntity = maxEntity;
	
	};
	
	var detectSentimentInUtterance = function(utterance, processedUtterance){
		
		var mySelf = this;
		this.understoodUtterance = processedUtterance;
		
		sentiment(utterance, function(err, results){
			if(err){ throw err; }
			mySelf.understoodUtterance.sentiment = results;
		});
		
	};
	
	var detectQuestionInUtterance = function(utterance, processedUtterance){
		
		var classification = classifier.classify(utterance.toLowerCase());
		console.log("Classification Received is " + classification);
		if(classification.value >= 0.95){
			processedUtterance.question.type = classification.label;
		}
		
	};
	
	var detectStandardNamedEntities = function(utterance, processedUtterance){
		
	};
	
	this.figureThisOut = function(utterance, callback){
		
		var error;
		
		//TODO: Figure out how to informedly add the isQuestion field - for now assume we never get questions ( Talk to Prof. Traum ? )
		var processedUtterance = {
				sentiment : {},
				books : [],
				authors : [],
				genres : [],
				mostLikelyEntity : {},
				anyOtherNamedEntities : [],
				question : {}
		};
		
		detectSentimentInUtterance(utterance, processedUtterance);
		getMostLikelyBooksInUtterance(utterance, processedUtterance);
		getMostLikelyAuthorsInUtterance(utterance, processedUtterance);
		getMostLikelyGenresInUtterance(utterance, processedUtterance);
		getMostLikelyNamedEntityInUtterance(processedUtterance.authors, processedUtterance.books, processedUtterance.genres, processedUtterance);
		detectQuestionInUtterance(utterance, processedUtterance);
		
		callback(error, processedUtterance);
		
	};
	
};

module.exports = NLU;