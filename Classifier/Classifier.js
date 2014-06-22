var natural = require("natural");


var Classifier = function(){
	
	var self = this;
	
	this.topicChangeRequests = [ "Okay, but can we talk about something else", "Alright, but can we talk about a different book",
	                            "Can we please change the subject", "Dude I am done with this book, can we talk about something else",
	                            "...", "errr...", "I don't know what to say", "Ummm...", "ohhkayy", "Why are you going on about this",
	                            "Can we talk about some other book", "Let's talk about some other book", "Let's talk about something else",
	                            "Can we talk about some other book please", "Let's talk about some other book please"
	                            ];
	this.favouriteAuthor = ["Who is your favourite author", "Who is your favorite author", "Whose books do you read most", 
	                       "What is the name of your favourite author", "What is the name of your favorite author",
	                       "Who is the author who influenced you the most", "Which author do you like", "What author do you like the most",
	                       "Which author do you like the most"];
	
	this.favouriteBook = ["What is your favourite book", "What is your favorite book", 
	                     "Which is your favourite book", "Which is your favourite book",
	                     "What book do you like the most", "Which book do you like the most", 
	                     "Tell me about your favourite book", "Tell me about your favorite book",
	                     "What kind of books do you read", "What sort of books do you read",
	   ];
	
	this.bookFollowUp = [ "What of it", "Tell me about it", "What about it", "Nope I haven't read it - tell me about it", "Yes do tell", "Talk about it"
	                     ];
	
	this.authorFollowUp = [
	                      "What have you heard",
	                      "What have you read",
	                      "What have you read by them",
	                      "What have you heard of them",
	                      "What have you read by her",
	                      "What have you read by him",
	                      "What did you hear"
	                      ];
	
	this.bookJustification = [
	                         "Why do you think that", "Why do you say so", "Why do you say that", "Why do you have such an extreme opinion",
	                         "That's what you think - why", "Dude why"
	                     ];
	
	this.stalling = [ "I agree", "I see", "Is that so", "uhuh", "I believe so", "mm hmm"];
	
	this.bye = [ "Okay bye", "Alright bbye", "I have to go", "I must leave", "bye bye", "ok bye", "I gotta go"]

	this.train = function(){
		
		self.classifier = new natural.LogisticRegressionClassifier();
		
		self.topicChangeRequests.forEach(function(utterance){
			self.classifier.addDocument(utterance, "topic-change");
		});
		
		self.favouriteAuthor.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "favourite-author");
		});
		
		self.favouriteBook.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "favourite-book");
		});
		
		self.authorFollowUp.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "author-follow-up");
		});
		
		self.bookJustification.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "book-justification");
		});
		
		self.bookFollowUp.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "book-follow-up");
		});
		
		self.stalling.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "stalling");
		});
		
		self.bye.forEach(function(utterance){
			self.classifier.addDocument(utterance.toLowerCase(), "bye");
		});
		
		self.classifier.train();
	};
	
	
	this.classify = function(document){
		
		var retVal = {};
		console.log(document);
		var classification = self.classifier.classify(document);
		var allLabelValues = self.classifier.getClassifications(document);
		allLabelValues.forEach(function(labelVal){
			if(labelVal.label === classification){
				retVal = labelVal;
			}
		});
		
		return retVal;
		
	};
	
};

module.exports = Classifier;