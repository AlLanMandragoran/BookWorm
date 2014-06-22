var events = require("events");

var NLG = function(is, systemUtteranceProcessor){
	
	
	var self = this;
	
	var informationState = is;
	var isEventEmitter = is.getEmitter();
	this.utteranceProcessor = systemUtteranceProcessor;
	
	this.setUtteranceProcessor = function(processor){
		console.log("NLG: setting utterance processor to " + processor);
		self.utteranceProcessor = processor;
	};

	this.utterancePool = function(){
		
			this.utterancesBasedOnReviews =  {
				generic : ["I thought <ARTICLE_PREFIX> <REVIEW>", "I believe that <ARTICLE_PREFIX> <REVIEW>", "I do think I wouldn't be too far off if I said <ARTICLE_PREFIX> <REVIEW>"],
				reviewPositiveSystemLiked : ["I noticed that <ARTICLE_PREFIX> <REVIEW>", "What I liked most about the book was how <ARTICLE_PREFIX> <REVIEW>",
				                             "I thought it was cool how <ARTICLE_PREFIX> <REVIEW>", "Someone who read the book said <ARTICLE_PREFIX> <REVIEW> and I can't agree with them more!"],
				reviewNegativeSystemLiked : ["However, I didn't like how <ARTICLE_PREFIX> <REVIEW>", "Although I liked the book, I didn't really like the fact that <ARTICLE_PREFIX> <REVIEW>",
				                             "Having said that, <ARTICLE_PREFIX> <REVIEW>", "I am rather fond of the book, but I did think <ARTICLE_PREFIX> <REVIEW>", "I know some people didn't like the book because of how <ARTICLE_PREFIX> <REVIEW>", "I can't believe someone thought <ARTICLE_PREFIX> <REVIEW>!"],
				reviewPositiveSystemDisliked : ["Although I didn't like the book much, I have friends who think <ARTICLE_PREFIX> <REVIEW>", "I myself am not a big fan of the book - but I do know some people think <ARTICLE_PREFIX> <REVIEW>",
				                                "Some people say <ARTICLE_PREFIX> <REVIEW> and I do rather disagree with them", "Some describe the book like so - <REVIEW> - but I can't really agree with them"],
				reviewNegativeSystemDisliked : ["I disliked the fact that <ARTICLE_PREFIX> <REVIEW>", "I do rather think <ARTICLE_PREFIX> <REVIEW>", "I thought the most awful thing about the book was how <ARTICLE_PREFIX> <REVIEW>",
				                                "It was absolutely appalling how <ARTICLE_PREFIX> <REVIEW>", "What I disliked the most about the book was <ARTICLE_PREFIX> <REVIEW>"],
				noReviewsPretendReadLiked: ["I read the book a long time ago. I remember liking it, but don't remember much else", "I remember liking how the characters were developed"],
				noReviewsPretendReadDidntLike : ["I've read the book, but didn't really like it. Can't remember why, though - it was a rather long time ago...",
				                                 "I thought the characters weren't particularly likeable"],
				noReviewPretendDidntRead : ["Oh I've heard of the book - haven't read it though"],
				noReviewPretendDidntReadPositiveReco : ["I've heard of the book, but haven't read it. I've had a lot of people recommend it to me though."],
				noReviewPretendDidntReadNegativeReco : ["I've heard of the book, but haven't read it. Many people who've read it didn't seem to like it though"],
				systemPositiveJustify : ["I really liked the fact that <ARTICLE_PREFIX> <REVIEW>", "For me <ARTICLE_PREFIX> <REVIEW> that worked the most"],
				systemNegativeJustify : ["I guess I didn't quite like how <ARTICLE_PREFIX> <REVIEW>", "Hmmm... I s'pose it was mostly because <ARTICLE_PREFIX> <REVIEW>"],
				systemJustifyDontRemember : ["I don't quite remember - I read it a long time ago, but I do remember I <SYSTEM_OPINION> it"],
				systemDisagreePrefixes : ["Hmmm... I think I disagree. I do believe that <ARTICLE_PREFIX> <REVIEW>", "Nah, <ARTICLE_PREFIX> <REVIEW>", "Actually, I think <ARTICLE_PREFIX> <REVIEW>", "On the contrary <ARTICLE_PREFIX> <REVIEW>"],
				systemAgreePrefixes : ["I agree with you. In fact <ARTICLE_PREFIX> <REVIEW>", "I will go one up and say <ARTICLE_PREFIX> <REVIEW>", "In fact, <ARTICLE_PREFIX> <REVIEW>", "Indeed <ARTICLE_PREFIX> <REVIEW>", "I agree, moreover <ARTICLE_PREFIX> <REVIEW>"],
				exclamationOrQuestion : ["I know some people who've read the book say <REVIEW>", "Someone I know who's read the book said <REVIEW>", "Some of my friends go <REVIEW>"]
			};
			
			this.utterancesBasedOnAuthor = {
				focusGenre : ["Most of their books are <GENRE> I think", "Right, they're the one who writes a lot of <GENRE>?", "I find most of their books are <GENRE>"],
				prolificWriter : ["They seem to have a written a lot of books!", "They're a very prolific writer - they've written several books I believe"],
				notWidelyRead : ["He doesn't seem to be widely read - at least, not many people who've read their books seems to "],
				muchLiked : ["Most people who've read <AUTHOR>'s books seem to like them", "They seem to be pretty well-liked"],
				notLikedMuch : ["Most people who've read <AUTHOR> don't seem to like his books", "The author's books don't seem to be very popular"],
			};
			
			this.utterancesBasedOnSystemPersonality = {
				bookInFavourites : ["Oh, that's one of my favourite books!", "I love that book! I think it's absolutely brilliant!", "There is some excellent writing in that book!"],
				genreInFavourites : ["I like books about <GENRE>", "I like <GENRE> books", "Most of my favorite books are <GENRE>"],
				authorInFavourites : ["<AUTHOR> is one of my favorites! I think I've read most of their books", "<AUTHOR> is a brilliant writer. I enjoy reading their work", "<AUTHOR>? Oh I am a big fan of theirs!"]
			};
			
			this.utterancesBasedOnSummaryRating = {
				summarizeLiked : ["Most people who've read the book seem to have liked it very much", "A lot of people think the book is brilliant"],
				summarizeDisliked : ["Most people who've read the book don't seem to be impressed", "A lot of people seem to think the book isn't great", "Many people don't like the book"]
			};
			
			this.utterancesToIntroduceUserBook = {
				introduceBook : ["<BOOK> ? I think I have read that!", "Hmm.. I do believe I have read <BOOK>", "I think I have read <BOOK>"]
			};
			
			this.utterancesToIntroduceUserAuthor = {
				introduceAuthor : ["<AUTHOR>? I've heard of them!", "<AUTHOR>? I've read a few books by them", "<AUTHOR>? I think I've read something by them."]
			};
			
			this.utterancesToIntroduceUserGenre = {
				introduceGenre : ["I read a lot of <GENRE> books", "I've read a lot of <GENRE>"]
			};
			
			this.utterancesToIntroduceSystemBook = {
				introduceBookQuestion : ["Have you heard of <BOOK> by <AUTHOR>?", "Have you read <BOOK> by <AUTHOR>?", "What do you think of <BOOK> by <AUTHOR>?"],
				introduceBookStatement : ["Hmmmm... I think I <SYSTEM_OPINION> it"], //TODO: Add some stuff with optional System Opinion
				introduceBookAsFavourite : ["It is one of my favourite books"]
			};
			
			this.utterancesToIntroduceSystemAuthor = {
				introduceAuthorQuestion : ["Have you heard of <AUTHOR>?", "Have you read any books by <AUTHOR>?", "What do you think of <AUTHOR>?"],
			};
			
			this.utterancesToBidGoodbye = {
				bidGoodBye : ["Alright bye! Thank you for making the time to talk to me :) I enjoyed chatting with you."]
			};
			
			this.utterancesForFavourites = {
					favouriteBook : ["<BOOK> is one of my favourites. Have you read it?"],
					favouriteAuthor : ["One of my favourite authors is <AUTHOR>. Have you read anything by him", "I am a big fan of <AUTHOR>'s books"],
					favouriteGenre : ["I like to read <GENRE> books", "I am a big fan of <GENRE> books"]
			};
			
	};
	
	//TODO: Replace this with a legitimate computation 
	self.utterancesOriginallyAvailable = 50;
	//TODO: Replace this to be comptued as a percentage of the value above
	self.utterancesLeftCount = self.utterancesOriginallyAvailable/2;
	self.unusedUtterancesForCurrentBook = new self.utterancePool();
	self.replacementObject =  {'book' : "", 'author' : "", 'systemOpinion' : "", 'review' : "", 'genre' : "", 'similarity' : "", "articlePrefix" : ""};
	
	this.setDefaultValuesForReplacementObject = function(){
		self.replacementObject = {'book' : informationState.currentBook.book.name, 'author' : informationState.currentBook.book.authorName,
				'systemOpinion' : informationState.currentBook.systemOpinion, 'review' : "", 'genre' : "", 'similarity' : "", 'articlePrefix' : ""};
	};
	
	var populateUtterancesThatCanBeUsedForCurrentBook = function(){
		self.unusedUtterancesForCurrentBook = new self.utterancePool();
		self.setDefaultValuesForReplacementObject();
		self.utterancesLeftCount = self.utterancesOriginallyAvailable/2;
	};
	
	isEventEmitter.on('bookChanged', populateUtterancesThatCanBeUsedForCurrentBook);
	
	var getRandomNumber = function(max){
		var random = Math.floor(Math.random()*100);
		random = random%max;
		return random;
	};
	
	var replaceTagsWithValues = function(utterance){
		utterance = utterance.replace(/<BOOK>/gi, self.replacementObject.book);
		utterance = utterance.replace(/<AUTHOR>/gi, self.replacementObject.author);
		console.log(self.replacementObject);
		utterance = utterance.replace(/<REVIEW>/gi, self.replacementObject.review.toLowerCase());
		utterance = utterance.replace(/<SYSTEM_OPINION>/gi, self.replacementObject.systemOpinion.toLowerCase());
		utterance = utterance.replace(/<GENRE>/gi, self.replacementObject.genre.toLowerCase());
		utterance = utterance.replace(/<SIMILARITY>/gi, self.replacementObject.similarity.toLowerCase());
		utterance = utterance.replace(/<ARTICLE_PREFIX>/gi, self.replacementObject.articlePrefix.toLowerCase());
		console.log("Final Utterance here is " + utterance);
		return utterance;
	};
	
	this.nlgEventEmitter = new events.EventEmitter();
	
	this.getEmitter = function(){
		return self.nlgEventEmitter;
	};
	
	var favouriteBookQuestions = ["What's your favourite book?", "So, tell me about your favourite book!", "We can start by talking about your favourite book!"];
	this.askUserForFavouriteBook = function(){
		var questionToAsk = getRandomNumber(favouriteBookQuestions.length);
		systemUtteranceProcessor(favouriteBookQuestions[questionToAsk]);
	};
	
	var favouriteAuthorQuestions = ["Who's your favourite author?", "So, tell me about your favourite author!", "We can start by talking about your favourite author!"];
	this.askUserForFavouriteAuthor = function(){
		var questionToAsk = getRandomNumber(favouriteAuthorQuestions.length);
		systemUtteranceProcessor(favouriteAuthorQuestions[questionToAsk]);
	};
	
	var favouriteGenreQuestions = ["What kind of books do you like to read?"];
	this.askUserForFavouriteGenre = function(){
		var questionToAsk = getRandomNumber(favouriteGenreQuestions.length);
		systemUtteranceProcessor(favouriteGenreQuestions[questionToAsk]);
	};
	
	
	this.introduceBookWorm = function(){
		systemUtteranceProcessor("Hello I am Guinevere");
	};
	
	this.speak = function(utterance, replacementObject){
		console.log("Came here with utterance " + utterance);
		console.log("Utterance Processor is " + self.utteranceProcessor);
		self.utteranceProcessor(replaceTagsWithValues(utterance, replacementObject));
	};

};

module.exports = NLG;