var Personality = function(allTheBooks){

	var self = this;
	this.favouriteBooks = [];
	this.favouriteAuthors = [];
	this.favouriteGenres = [];
	
	var allBooks = allTheBooks;
	var rand = Math.random()*30000;
	rand = Math.floor(rand%allBooks.length);
	
	/* Compute Favorite Books */
	for(var i=0; i<10; i++){
		this.favouriteBooks.push(allBooks[rand]);
		rand = (rand + 100)%allBooks.length;
	}
	
	/* Compute Favorite Authors and Favorite Genres from Favorite Books */
	this.favouriteBooks.forEach(function(book){
		self.favouriteAuthors.push(book.authorName);
		var genreList = book.genre.split(":");
		genreList.forEach(function(genre){
			self.favouriteGenres.push(genre);
		});
	});
	
	var onlyUnique = function(value, index, array){
		return array.indexOf(value) === index;
	};
	
	var tempArray;
	
	tempArray = self.favouriteAuthors.filter(onlyUnique);
	self.favouriteAuthors = tempArray;
	
	tempArray = self.favouriteGenres.filter(onlyUnique);
	self.favouriteGenres = tempArray;

};

module.exports = Personality;