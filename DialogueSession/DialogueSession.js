var events = require("events");
var DialogueManager = require("../DialogueManager/DialogueManager");
var readline = require("readline");

var DialogueSession = function(sessionID, userUtteranceSource, systemUtteranceSink, allTheThings){
	
	var self = this;
	
	console.log("Created a new Dialogue Session");
	this.sessionId = sessionID;
	this.emitter = new events.EventEmitter();
	this.dialogueManager = new DialogueManager(userUtteranceSource, systemUtteranceSink, allTheThings);
	
	//TODO - get Chat log location and create new file 
	this.chatLogFile = "";
	
	this.getEmitter = function(){
		return self.emitter;
	};
	
	this.getSessionId = function(){
		return self.sessionId;
	};
	
	this.getChatLogFile = function(){
		return self.chatLogFile;
	};
	
	
};

module.exports = DialogueSession;