var log4js = require('log4js');

var Logger = function(logFile, sessionID){
	
	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(logFile), sessionID);
	
	var self = this;
	this.logger = log4js.getLogger(sessionID);
	
	this.log = function(logMessage, level){
		
		if(!level){
			level = "debug";
		}
		
		self.logger[level](logMessage);
	};
	
};

module.exports = Logger;