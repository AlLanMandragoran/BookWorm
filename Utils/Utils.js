
var Utils = function(){
	
	this.generateCallBackForSQLiteQueryProcessing = function(emitter, arrayToStoreResults, eventToEmit, callback){

		var processResults = function(err, results){
			if(err) { throw err; }
			
			var mySelf = this;
			this.callback = callback;
			this.resultArray = arrayToStoreResults;

			results.forEach(function(row){
				mySelf.resultArray.push(row);
			});

			this.eventVal = eventToEmit;
			emitter.emit(this.eventVal);
			if(this.callback){
				this.callback();
			}
		};
		
		return processResults;
	};
	
	this.generateFunctionToWaitOnEvent = function(emitter, eventList, eventCompleted, allDoneEvent){

		var waiterFunction = function(){
			console.log("Completed event is " + eventCompleted);
			console.log("Event List is ");
			console.log(eventList);
			eventList[eventCompleted] = true;
			for(var eventType in eventList){
				if(!eventList[eventType]){
					return;
				}
			}

			console.log("Emitting all done event as " + allDoneEvent);
			/* If I got here, all events have been completed */
			emitter.emit(allDoneEvent);
		};
		
		return waiterFunction;
		
	};
	
	this.randomize = function(max){
		var randomVal =  Math.floor((Math.random()*100)%max);
		return randomVal;
	};
	
};

module.exports = Utils;
