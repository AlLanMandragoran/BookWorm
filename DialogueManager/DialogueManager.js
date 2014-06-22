var nlgMod = require("../NLG/NLG");
var nluMod = require("../NLU/NLU");
var is = require("../InformationState/InformationState");
var events = require("events");
var natural = require("natural");
var tokenizer = new natural.WordTokenizer();

//TODO: Add logging in ALL THE FILES!

var DialogueManager = function(userUtteranceSource, systemUtteranceProcessor, allTheThings){
	
	var self = this;
	this.managerEventEmitter = new events.EventEmitter();
	this.informationState = new is(allTheThings);
	
	var userUtteranceSourceEmitter = userUtteranceSource.getEmitter();
	
	userUtteranceSourceEmitter.on('utterance', function(options){
		console.log("Got user utterance as " + options.utterance);
		self.nlg.setUtteranceProcessor(options.nlgProcessor);
		processUtterance(options.utterance);
	});
	
	this.getEmitter = function(){
		return self.managerEventEmitter;
	};
	
	var infoStateEventEmitter = this.informationState.getEmitter();
	
	self.currentDialogueNetwork = {
		utteranceCount : 0,
		theFunction : {}
	};
	
	var randomize = function(max){
		return Math.floor((Math.random()*100)%max);
	};
	
	this.introduceBookFoundInUserUtterance = function(processedUtterance){
		console.log(processedUtterance);
		console.log("Introducing book found in user utterance");
		infoStateEventEmitter.once('bookChanged', function(){
			var length = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserBook.introduceBook.length;
			var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserBook.introduceBook[randomize(length)];
			self.nlg.speak(utteranceToUse);
			self.nlg.utterancesLeftCount = self.nlg.utterancesLeftCount - 1;
			var index = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserBook.introduceBook.indexOf(utteranceToUse);
			self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserBook.introduceBook.splice(index,1);
			self.setCurrentDialogueNetwork(self.talkAboutCurrentBook);
		});
		self.informationState.setCurrentBook(processedUtterance.books.one.book);
		
	};
	
	this.introduceAuthorFoundInUserUtterance = function(processedUtterance){
		console.log(processedUtterance);
		console.log("Introducing Author found in user utterance");
		var length = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserAuthor.introduceAuthor.length;
		var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserAuthor.introduceAuthor[randomize(length)];
		self.nlg.replacementObject.author = processedUtterance.authors.one.author.name;
		console.log("decided on utterance " + utteranceToUse);
		self.nlg.speak(utteranceToUse);
		self.nlg.utterancesLeftCount = self.nlg.utterancesLeftCount - 1;
		var index = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserAuthor.introduceAuthor.indexOf(utteranceToUse);
		self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserAuthor.introduceAuthor.splice(index, 1);
		
		infoStateEventEmitter.once('authorChanged', function(){
			var length = self.informationState.currentAuthor.booksByAuthor.length;
			var nextBook = self.informationState.currentAuthor.booksByAuthor[randomize(length)];
			infoStateEventEmitter.once('bookChanged', function(){
				console.log("Book Changed");
				self.setCurrentDialogueNetwork(self.introduceBookChosenBySystem);
			});
			self.informationState.setCurrentBook(nextBook);
		});
		
		self.informationState.setCurrentAuthor(processedUtterance.authors.one.author);
		
	};
	
	this.introduceGenreFoundInUserUtterance = function(processedUtterance){
		console.log("Introducing Genre Found in User Utterance");
		var length = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserGenre.introduceGenre.length;
		var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserGenre.introduceGenre[randomize(length)];
		console.log(processedUtterance.genres);
		self.nlg.replacementObject.genre = processedUtterance.genres.one.genre;
		self.nlg.speak(utteranceToUse);
		self.nlg.utterancesLeftCount = self.nlg.utterancesLeftCount - 1;
		var index = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserGenre.introduceGenre.indexOf(utteranceToUse);
		self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceUserGenre.introduceGenre.splice(index, 1);
		console.log("Waiting for genre to change");
		infoStateEventEmitter.once('genreChanged', function(){
			console.log("Changing the genre");
			var length = self.informationState.currentGenre.booksByGenre.length;
			var nextBook = self.informationState.currentGenre.booksByGenre[randomize(length)];
			infoStateEventEmitter.once('bookChanged', function(){
				console.log("The book has changed so I am here waiting to say the next thing");
				self.setCurrentDialogueNetwork(self.introduceBookChosenBySystem);
			});
			self.informationState.setCurrentBook(nextBook);
		});
		console.log("Here's the genre thingy");
		console.log(processedUtterance.genres.one.genre);
		self.informationState.setCurrentGenre(processedUtterance.genres.one.genre);
		
	};
	
	this.introduceReasonForBookChosenBySystem = function(processedUtterance){
		console.log(processedUtterance);
		self.nlg.setDefaultValuesForReplacementObject();
		var length = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookStatement.length;
		var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookStatement[randomize(length)];
		self.nlg.replacementObject.similarity = self.informationState.bookSimilarBy;
		self.nlg.replacementObject.book = self.informationState.prevBook;
		self.nlg.speak(utteranceToUse);
		self.nlg.setDefaultValuesForReplacementObject();
		self.setCurrentDialogueNetwork(self.talkAboutCurrentBook);
		
	};
	
	this.introduceBookChosenBySystem = function(processedUtterance){
		
		console.log(processedUtterance);
		console.log("Introducing Book chosen by system");
		var length = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookQuestion.length;
		var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookQuestion[randomize(length)];
		self.nlg.speak(utteranceToUse);
		self.nlg.utterancesLeftCount = self.nlg.utterancesLeftCount - 1;
		var index = self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookQuestion.indexOf(utteranceToUse);
		self.nlg.unusedUtterancesForCurrentBook.utterancesToIntroduceSystemBook.introduceBookQuestion.splice(index, 1);
		self.setCurrentDialogueNetwork(self.introduceReasonForBookChosenBySystem);
		
	};
	
	
	//TODO: Figure out whether this network is required - if it is, fill in info for this!
	this.introduceAuthorChosenBySystem = function(processedUtterance){
		
	};
	
	var pickNextBook = function(processedUtterance){
		
		console.log(processedUtterance);
		console.log("picking next book");
		
		var nameOfCurrentBook = self.informationState.currentBook.book.name;
		var pickBookFrom = self.informationState.currentBook.allSimilarBooks;
		
		console.log("Options for the next book are like so");
		console.log(pickBookFrom);
		
		var options = Object.keys(self.informationState.currentBook.allSimilarBooks);
		console.log("Options are " + options);
		var pick = randomize(options.length);
		console.log("Decided to pick " + pick);
		var length = pickBookFrom[options[pick]].length;
		console.log("Length of book to be picked " + length);
		var nextBook = pickBookFrom[options[pick]][randomize(length)];
		console.log("Decided on next book " + nextBook);
		self.informationState.bookSimilarBy = options[pick];
		self.informationState.prevBook = nameOfCurrentBook;
		infoStateEventEmitter.once('bookChanged', function(){
			console.log("The book has been changed");
			self.introduceBookChosenBySystem(processedUtterance);
		});
		
		self.informationState.setCurrentBook(nextBook);
		
	};
	
	var opensWithArticle = function(review){
		
		var tokens = tokenizer.tokenize(review);
		if(!tokens.length){
			return false;
		}
		if(tokens[0].toLowerCase() === 'a' || tokens[0].toLowerCase() === 'an' || tokens[0].toLowerCase() === 'the'){
			return true;
		}
		else{
			return false;
		}
		
	};
	
	var hasExclamationPointOrIsAQuestion = function(review){
		console.log("Review received is " + review);
		console.log("Checking if the review has an exclamation point or a question mark");
		if(review.match(/!/) || review.match(/\?/)){
			console.log("The review does have a question mark or exclamation point");
			return true;
		}
		else {
			console.log("Nope! Nothing here");
			return false;
		}
	};
	
	var isAllCaps = function(review){
		console.log("Received review as " + review);
		console.log("Checking for all caps");
		for(var i=0; i<review.length; i++){
			if('a' <= review[i] && 'z' >= review[i]){
				console.log("Found a lower case character so assuming not all caps");
				return false;
			}
		}
		console.log("Found an all-caps review");
		return true;
	};
	
	var getAppropriateArticleForAdjective = function(review){
		
		var lcReview = review.toLowerCase();
		if(lcReview[0] === 'a' || lcReview[0] === 'e' || lcReview[0] === 'i' || lcReview[0] === 'o' || lcReview[0] === 'u'){
			return 'it is an';
		}
		else{
			var a = randomize(2);
			if(a === 1){
				return 'it is the';
			}
			else{
				return 'it is a';
			}
		}
		
	};
	
	this.talkAboutCurrentBook = function(processedUtterance){
		
		console.log(processedUtterance);
		console.log("talking about current book\n");
		var pickFrom, length, toPick;
		self.nlg.setDefaultValuesForReplacementObject();
		var pickUtteranceFrom, selectOptions;
		var question = Object.keys(processedUtterance.question);
		
		//TODO: Replace this with value from a config file
		var threshold = 0.5;

		if(processedUtterance.mostLikelyEntity.value > threshold && processedUtterance.question.label !== 'stalling'){
			
			console.log("Processed utterance has an entity greater than threshold\n");
			if(processedUtterance.mostLikelyEntity.type === 'author'){
				self.introduceAuthorFoundInUserUtterance(processedUtterance);
			}
			else if(processedUtterance.mostLikelyEntity.type === 'book'){
				self.introduceBookFoundInUserUtterance(processedUtterance);
			}
			else if(processedUtterance.mostLikelyEntity.type === 'genre'){
				self.introduceGenreFoundInUserUtterance(processedUtterance);
			}
		} //TODO: Replace user interest thingy with a threshold picked from config
		else if(self.nlg.utterancesLeftCount <= 5 || self.informationState.currentBook.userInterest <= 50 || (question.length && question.type === 'topic-change')){
			console.log("Picking new book\n");
			pickNextBook(processedUtterance);
		}
		else if(processedUtterance.question.type === 'bye'){
			self.nlg.speak(self.nlg.unusedUtterancesForCurrentBook.utterancesToBidGoodbye.bidGoodBye[0]); //TODO : Replace with proper process
		}
		else if(processedUtterance.question.type === 'favourite-book'){
			var faveBooksLength = self.informationState.personality.favouriteBooks.length;
			console.log(faveBooksLength);
			var faveBook = self.informationState.personality.favouriteBooks[randomize(faveBooksLength)];
			console.log(faveBook);
			self.informationState.setCurrentBook(faveBook);	
			console.log("Ive set book");
			
			var utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesForFavourites.favouriteBook[0];
			console.log(utteranceToUse);
			self.nlg.replacementObject.book = faveBook.name;
			self.nlg.speak(utteranceToUse);
			self.setCurrentDialogueNetwork(self.talkAboutCurrentBook);
		}
		else{
			console.log("Figuring out what to say now\n");
			if(question.length  && processedUtterance.question.type === 'book-justification'){
				selectOptions = ['justify'];
				if(self.informationState.currentBook.systemOpinion === 'Liked'){
					pickUtteranceFrom = {
							'justify' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemPositiveJustify,
								'review' : self.informationState.currentBook.positiveReviews
							}
					};
				}
				else{
					pickUtteranceFrom = {
							'justify' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemNegativeJustify,
								'review' : self.informationState.currentBook.negativeReviews
							}
					};
				}
			}
			else {
				selectOptions = ['positive', 'negative', 'general'];
				if(self.informationState.currentBook.systemOpinion === "Liked"){
					pickUtteranceFrom = {
							'general' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.generic,
								'review' : self.informationState.currentBook.positiveReviews
							},
							'positive' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.reviewPositiveSystemLiked,
								'review' : self.informationState.currentBook.positiveReviews
							},
							'negative' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.reviewNegativeSystemLiked,
								'review' : self.informationState.currentBook.negativeReviews
							}
					};
					if(processedUtterance.sentiment < 0){
						self.informationState.currentBook.userInterest = self.informationState.currentBook.userInterest - 10;
						pickUtteranceFrom.disagree = {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemDisagreePrefixes,
								'review' : self.informationState.currentBook.positiveReviews
						};
						selectOptions.push('disagree');
					}
					else{
						self.informationState.currentBook.userInterest = self.informationState.currentBook.userInterest + 10;
						pickUtteranceFrom.agree = {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemAgreePrefixes,
								'review' : self.informationState.currentBook.positiveReviews
						};
						selectOptions.push('agree');
					}
				}
				else{
					pickUtteranceFrom = {
							'general' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.generic,
								'review' : self.informationState.currentBook.negativeReviews
							},
							'positive' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.reviewPositiveSystemDisliked,
								'review' : self.informationState.currentBook.positiveReviews
							},
							'negative' : {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.reviewNegativeSystemDisliked,
								'review' : self.informationState.currentBook.negativeReviews
							}
					};
					if(processedUtterance.sentiment < 0){
						self.informationState.currentBook.userInterest = self.informationState.currentBook.userInterest + 10;
						pickUtteranceFrom.agree = {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemAgreePrefixes,
								'review' : self.informationState.currentBook.negativeReviews
						};
						selectOptions.push('agree');
					}
					else{
						self.informationState.currentBook.userInterest = self.informationState.currentBook.userInterest - 10;
						pickUtteranceFrom.disagree = {
								'utterance' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemDisagreePrefixes,
								'review' : self.informationState.currentBook.negativeReviews
						};
						selectOptions.push('disagree');
					}
				}
			}
			
			var toRemove = [];
			console.log(selectOptions);
			console.log(pickUtteranceFrom);
			selectOptions.forEach(function(choice){
				console.log("Option here is " + choice);
				if(pickUtteranceFrom[choice].utterance.length < 1 || pickUtteranceFrom[choice].review.length < 1){
					console.log("Option " + choice + " has no utterances, so I gonna remove it");
					toRemove.push(choice);
				}
			});
			
			if(toRemove.length === selectOptions.length && self.currentDialogueNetwork.utteranceCount < 1 && selectOptions[0] !== 'justify'){
				console.log("This one doesn't have any reviews we can use - so figuring out how to stall");
				console.log("Remove Length is the same as the size of selected options");
				var didntReadOptions = ['readLiked', 'readDidntLike', 'didntRead', 'didntReadPositiveReco', 'didntReadNegativeReco'];
				console.log(" Read Liked " + self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewsPretendReadLiked);
				console.log("Read Didn't Like" + self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewsPretendReadDidntLike);
				console.log("Didn't Read " + self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntRead);
				console.log("Didn't read positive reco " + self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntReadPositiveReco);
				console.log("Didn't read negative reco " + self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntReadNegativeReco);
				var utterancesForOptions = {
						'readLiked' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewsPretendReadLiked,
						'readDidntLike' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewsPretendReadDidntLike,
						'didntRead' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntRead,
						'didntReadPositiveReco' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntReadPositiveReco,
						'didntReadNegativeReco' : self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.noReviewPretendDidntReadNegativeReco
				};
				console.log("Set up options for utterances");
				var toSelect = randomize(didntReadOptions.length);
				length = utterancesForOptions[didntReadOptions[toSelect]].length;
				console.log('To Select ' + toSelect);
				console.log('length ' + length);
				var randomOption = randomize(length);
				console.log(utterancesForOptions);
				console.log(utterancesForOptions[didntReadOptions[toSelect]][randomOption])
				self.nlg.speak(utterancesForOptions[didntReadOptions[toSelect]][randomOption]);
				pickNextBook(processedUtterance);
			}
			else if(toRemove.length === selectOptions.length && selectOptions[0] === 'justify'){
				length = self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemJustifyDontRemember.length;
				self.nlg.speak(self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.systemJustifyDontRemember[randomize(length)]);
			}
			else{
				if(toRemove.length === selectOptions.length){
					console.log("Looks like we've used up all our utterances so picking another book");
					pickNextBook(processedUtterance);
				}
				toRemove.forEach(function(theOne){
					console.log("Removing the ones that need removing");
					selectOptions.splice(selectOptions.indexOf(theOne), 1);
				});
				var weShallTalkAbout = randomize(selectOptions.length);
				var reviewLength = pickUtteranceFrom[selectOptions[weShallTalkAbout]].review.length;
				var reviewLoc = randomize(reviewLength);
				var review = pickUtteranceFrom[selectOptions[weShallTalkAbout]].review[reviewLoc];
				
				console.log("Review picked " + review);
				self.nlg.replacementObject.review = review.reviewTitle;
				var utteranceToUse;
				
				console.log("This one actually has reviews we can use - so figuring out which one to say");
				if(hasExclamationPointOrIsAQuestion(review.reviewTitle) || isAllCaps(review.reviewTitle)){
					console.log("Found out it is an extreme review");
					var selectedUtteranceLoc = randomize(self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.exclamationOrQuestion.length);
					utteranceToUse = self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.exclamationOrQuestion[selectedUtteranceLoc];
					console.log("Utterance I have chosen is " + utteranceToUse);
					self.nlg.unusedUtterancesForCurrentBook.utterancesBasedOnReviews.exclamationOrQuestion.splice(selectedUtteranceLoc, 1);
				}
				else{
					console.log("Checking what kind of article prefix to add");
					if(opensWithArticle(review.reviewTitle)){
						console.log("The review opens with an article so adding a prefix");
						self.nlg.replacementObject.articlePrefix = "it is";
					}
					else{
						console.log("Review opens with adjective (we're assuming) so inserting an article");
						self.nlg.replacementObject.articlePrefix = getAppropriateArticleForAdjective(review.reviewTitle);
					}
					var utteranceArrayLength = pickUtteranceFrom[selectOptions[weShallTalkAbout]].utterance.length;
					console.log(pickUtteranceFrom);
					var utteranceLoc = randomize(utteranceArrayLength);
					console.log(weShallTalkAbout + " is what i want to talk about " + utteranceLoc + " is Utterance loc ");
					utteranceToUse = pickUtteranceFrom[selectOptions[weShallTalkAbout]].utterance[utteranceLoc];
					pickUtteranceFrom[selectOptions[weShallTalkAbout]].utterance.splice(utteranceLoc, 1);
				}
				console.log("Decided to use the following utterance " + utteranceToUse);
				self.nlg.speak(utteranceToUse);
				
				/* Assume user interest reduces a bit each utterance you continue talking about the book */
				pickUtteranceFrom[selectOptions[weShallTalkAbout]].review.splice(reviewLoc, 1);
				self.currentDialogueNetwork.utteranceCount = self.currentDialogueNetwork.utteranceCount + 1;
				self.informationState.currentBook.userInterest = self.informationState.currentBook.userInterest - 5;
			}
			
		}
		
	};
	
	var askAboutFavouriteBook = function(){
		console.log("Asking about favourite book");
		self.nlg.askUserForFavouriteBook();
		self.setCurrentDialogueNetwork(self.introduceBookFoundInUserUtterance);
	};
	
	var askAboutFavouriteAuthor = function(){
		console.log("Asking about favourite author");
		self.nlg.askUserForFavouriteAuthor();
		self.setCurrentDialogueNetwork(self.introduceAuthorFoundInUserUtterance);
	};
	
	var askAboutFavouriteGenre = function(){
		console.log("Asking about favourite genre");
		self.nlg.askUserForFavouriteGenre();
		self.setCurrentDialogueNetwork(self.introduceGenreFoundInUserUtterance);
	};
	
	var beginDialogueQuestionPossibilities = ['favorite-book', 'favorite-author', 'favorite-genre' ];
	var functionsForBeginningPossibilities = {
			'favorite-book': askAboutFavouriteBook,
			'favorite-author': askAboutFavouriteAuthor,
			'favorite-genre' : askAboutFavouriteGenre
	};
	
	var beginDialogue = function(){
		
		//self.nlg.introduceBookWorm();
		var optionSelected = beginDialogueQuestionPossibilities[randomize(beginDialogueQuestionPossibilities.length)];
		functionsForBeginningPossibilities[optionSelected]();
		
	};
	
	this.currentDialogueNetwork = beginDialogue;
	
	this.setCurrentDialogueNetwork = function(dialogueNetworkFunction){
		self.currentDialogueNetwork.theFunction = dialogueNetworkFunction;
		self.currentDialogueNetwork.utteranceCount = 0;
	};
	
	var processUtterance = function(utterance){
		self.nlu.figureThisOut(utterance, function(err, processedUtterance){
			if(err){ throw err; }
			console.log(processedUtterance);
			console.log(self.currentDialogueNetwork);
			self.currentDialogueNetwork.theFunction(processedUtterance);
		});
	};

	//TODO: Add "Reading Right Now" as a question - but make sure you put in spoiler alerts or remove spoilers altogether
	
	this.engageInDialogue = function(){
		
		var startedWith = beginDialogue();
		
	};
	
	var initializeEnvironment = function(){
		self.nlg = new nlgMod(self.informationState, systemUtteranceProcessor);
		self.nlu = new nluMod(self.informationState);
		self.managerEventEmitter.emit('initialized');
		self.engageInDialogue();
	};
	
	initializeEnvironment();

		
};

module.exports = DialogueManager;