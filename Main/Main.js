var dm = require("../DialogueManager/DialogueManager" );
var ds = require("../DialogueSession/DialogueSession" );
var neoUtil = require("../Neo4j/Neo4jUtilities" );
var InformationState = require("../InformationState/InformationState" );
var sqlite = require("../SQLite/SQLiteUtils" );
var events = require("events" );
var readline = require("readline" );
var colors = require("colors" );
var restify = require("restify" );
var allThings = require("../CommonAllTheInfo/AllTheInfo");

var Logger = require("../Logger/Logger");

var server = restify.createServer();

var allTheThings = new allThings();

allTheThings.emitter.on('initialized', function(){
	server.listen(8080, function() {
		console.log( '%s listening at %s', server.name, server.url);
	});
});

var responder = function() {
	
	var self = this;
	this.emitter = new events.EventEmitter();
	this.getEmitter = function(){
		return self.emitter;
	};
	
	this.chatResponder = function(sessionID, data, response, callback){
	
		console.log("Responding to user chat");
		var nlgProcessor = function(utterance){
			console.log("Sending back utterance " + utterance);
			response.send(200, {'systemUtterance' : utterance, 'sessionID' : sessionID});
			callback();
		};

		console.log("Received user utterance " + data.utterance);
		var options = {
			'utterance' : data.utterance,
			'nlgProcessor' : nlgProcessor
		};
		self.emitter.emit('utterance', options);

	};

		
};

var respond = function(){
	
	console.log("Creating a new responder");
	return new responder();
	
};

var sessions = {};

var respondToChat = function(request, response, callback){
	
	console.log("Responding to a chat request by calling the correct one for the session");
	var myData = "";
	request.on('data', function(data){
		console.log("Data is " + data);
		myData = myData + data;
	});
	request.on('end', function(){
		myData = JSON.parse(myData);
		console.log(myData);
		if(myData.sessionID){
			if(sessions[myData.sessionID]){
				sessions[myData.sessionID].requestResponder.chatResponder(myData.sessionID, myData, response, callback);
			}
			else{
				response.send(403, "Attempting to access a session that doesn't exist!");
				callback();
			}
		}
		else{
			response.send(403, new Error("Attempting a chat without providing a sessionID!"));
			callback();
		}
	});
	request.on('error', function(error){
		console.log(error);
	});
	
	
};


var startNewSession = function(request, response, callback){
	console.log("starting a new session");
	var sessionID = new Date().getTime();
	var nlgProcessor = function(utterance){
			console.log("I am in the nlg processor for the first ever utterance");
			response.send(200, {'systemUtterance' : utterance, 'sessionID' : sessionID});
			callback();
	};
	
	var userUtteranceProcessor = new respond();
	var dialogueSession = new ds(sessionID, userUtteranceProcessor, nlgProcessor, allTheThings);
	
	sessions[sessionID] = {
			'dialogueSession' : dialogueSession,
			'requestResponder' : userUtteranceProcessor
	};
};


var endSession = function(request, response, callback){
	console.log("Ending a session");
	if(request.params.sessionID){
		if(sessions[request.sessionID]){
			delete sessions[request.sessionID];
		}
		else{
			response.send(403, "Attempting to end a session that doesn't exist!");
		}
	}
	else{
		response.send(403, new Error("Attempting to end a session without providing a sessionID!"));
		callback();
	}
};

server.get('/start', startNewSession);
server.head('/start', startNewSession);

server.get('/chat', respondToChat);
server.head('/chat', respondToChat);
server.post('/chat', respondToChat);

server.get('/end/:sessionID', endSession);
server.head('/end/:sessionID', endSession);

//server.get('/chat/:sessionID/:utterance', respondToChat);
//server.head('/chat/:sessionID/:utterance', respondToChat);

//server.get('/end/:sessionID', endSession);
//server.head('/end/:sessionID', endSession);