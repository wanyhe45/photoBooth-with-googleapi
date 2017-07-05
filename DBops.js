// Doing stuff with a database in Node.js

// Table was created with:
// CREATE TABLE PhotoLabels (fileName TEXT UNIQUE NOT NULL PRIMARY KEY, labels TEXT, favorite INTEGER)

var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFile = "photos.db"
var db = new sqlite3.Database(dbFile);  // new object, old DB

function errorCallback(err) {
    if (err) {
	console.log("error: ",err,"\n");
    }
}
	
function dataCallback(err, tableData) {
    if (err) {
	console.log("error: ",err,"\n");
    } else {
	console.log("got: ",tableData,"\n");
    }
}

// uncomment this line to see behavior when each opeartion is forced
// to complete it's callback before the next one starts
// You also need to uncomment a line at the bottom of this file
db.serialize( function () {

console.log("starting DB operations");

    // Insert or replace rows into the table
    db.run(
	'INSERT OR REPLACE INTO photoLabels VALUES ("hula.jpg", "", 0)',
	errorCallback);
    db.run(
	'INSERT OR REPLACE INTO photoLabels VALUES ("eagle.jpg", "", 0)',
	errorCallback);
    db.run(
	'INSERT OR REPLACE INTO photoLabels VALUES ("redwoods.jpg", "", 0)',
	errorCallback);

    // Changing data - the UPDATE statement
    db.run(
	'UPDATE photoLabels SET labels = "Dance, Performing Arts, Sports, Entertainment, Quinceañera, Event, Hula, Folk Dance" WHERE fileName = "hula.jpg" ',
    errorCallback);

    db.run(
    'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
    [ 'Habitat, Vegetation, Natural Environment, Woodland, Tree, Forest, Green, Ecosystem, Rainforest, Old Growth Forest', 'redwoods.jpg'],errorCallback);

    db.run(
    'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
    ['Bird, Beak, Bird Of Prey, Eagle, Vertebrate, Bald Eagle, Fauna, Accipitriformes, Wing', 'eagle.jpg'],errorCallback);

    db.get(
	'SELECT labels FROM photoLabels WHERE fileName = ?',
	["hula.jpg"],dataCallback);

    db.get(
    'SELECT labels FROM photoLabels WHERE fileName = ?',
    ["redwoods.jpg"],dataCallback);

    db.get(
    'SELECT labels FROM photoLabels WHERE fileName = ?',
    ["eagle.jpg"],dataCallback);


/* Some more examples of database commands you could try

    // Dump whole database 
    // db.all('SELECT * FROM photoLabels',dataCallback);

    // fill-in-the-blanks syntax for Update command
    db.run(
	'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
	['Bird, Beak, Bird Of Prey, Eagle, Vertebrate, Bald Eagle, Fauna, Accipitriformes, Wing', 'eagle.jpg'],errorCallback);

    db.run(
	'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
	[ 'Habitat, Vegetation, Natural Environment, Woodland, Tree, Forest, Green, Ecosystem, Rainforest, Old Growth Forest', 'redwoods.jpg'],errorCallback);

    // Getting all rows where a substring of the "labels" field 
    // matches the string "Bird"
    db.all(
	'SELECT * FROM photoLabels WHERE labels LIKE  ?',
	["%Bird%"],dataCallback);
*/

    db.close();

// You need to uncomment the line below when you uncomment the call
// to db.serialize 
});
