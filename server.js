/* This server, unlike our previous ones, uses the express framework */
var express = require('express');
var formidable = require('formidable');  // we upload images in forms
var querystring = require('querystring');
// this is good for parsing forms and reading in the images

// make a new express server object
var app = express();

var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFile = "photos.db"
var db = new sqlite3.Database(dbFile);  // new object, old DB

// // URL containing the API key 
url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyACVvKuyaUsED_STqg-J4u5MAS8LExUdEw';
// Now we build a pipeline for processing incoming HTTP requests

// Case 1: static files
app.use(express.static('public')); // serve static files from public
// if this succeeds, exits, and rest of the pipeline does not get done

// Case 2: queries
// An example query URL is "138.68.25.50:???/query?img=hula"
app.get('/query', function (request, response){
    // console.log(request.url);
    query = request.url.split("?")[1]; // get query string
    // console.log('----------------blablabla');
    var op1 = query.split("&")[0];
    var op2 = op1.split('=')[1];
    var op = query.substring(0,query.indexOf("="));
    if (op == "img") {
        // console.log("img");
       answer(query, response);
    } else if (op == "fav"){
        checkFav(query, response);
    } else if (op == "op") {
        if(op2 == "add"){
            addLabel(query, response);
        } else if(op2 == "remove"){
            removeLabel(query,response);
        } else if (op2 == "dump") {
            // console.log('found');
            getAllImg(query,response);
        } else if (op2 == "filter") {
            findLabel(query,response);
        } else if (op2 == "fav") {
            // console.log("favorite");
            favorite(query, response);
        }
    } else {
       sendCode(400,response,'query not recognized');
    }

});

// Case 3: upload images
// Responds to any POST request
app.post('/', function (request, response){
    var form = new formidable.IncomingForm();
    form.parse(request);

   form.on('fileBegin', function (name, file){
    // put it in /public
    file.path = __dirname + '/public/' + file.name;
    console.log("uploading ",file.name,name);

        // callback for when file is fully recieved
        form.on('end', function (){
            var request = require('request');
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            requestObject = {
          "requests": [
            {
              "image": {
                "source": {"imageUri": "http://138.68.25.50:7246/" + file.name}
                },
              "features": [{ "type": "LABEL_DETECTION" }]
            }
          ]
        }   
            // apiLabel(file.name);
            // var labelstr = "";
    request(
        { // HTTP header stuff
        url: url,
        method: "POST",
        headers: {"content-type": "application/json"},
        // stringifies object and puts into HTTP request body as JSON 
        json: requestObject,
        },
        // callback function for API request
        APIcallback
    );

    function errorCallback(err) {
        if (err) {
        console.log("file already exists");
        }
    }

    function APIcallback(err, APIresponse, body) {
        if ((err) || (APIresponse.statusCode != 200)) {
        console.log("Got API error"); 
        } else {
        APIresponseJSON = body.responses[0];

        labelstr = APIresponseJSON.labelAnnotations[0].description;
        for(var i = 1; i < APIresponseJSON.labelAnnotations.length; i++) {
            labelstr = labelstr + ", " + APIresponseJSON.labelAnnotations[i].description;
        }
        console.log(labelstr);
        db.run("INSERT INTO photoLabels VALUES (\""+file.name+"\",\"" + labelstr + "\", 0)",
            errorCallback);
            sendCode(201,response,'recieved file=' + labelstr);  // respond to browser

        }
    }
            // sendCode(201,response,'recieved file');  // respond to browser
        });
    });
});

app.listen(7246);

// sends off an HTTP response with the given status code and message
function sendCode(code,response,message) {
    response.status(code);
    response.send(message);
}
    
// Stuff for dummy query answering
// We'll replace this with a real database someday! 
function answer(query, response) {

    // console.log("answering");
    imgName = query.split("=");

    function dataCallback(err, tableData) {
    if (err) {
    console.log("error: ",err,"\n");
    } else {
        if (tableData) {
        var labels = tableData.labels;
        response.status(200);
        response.type("text/json");
        response.send(labels);
        } else {
        sendCode(400,response,"requested photo not found");
        }
    }
    }

    db.get(
    'SELECT labels FROM photoLabels WHERE fileName = ?',
    [imgName[1]],dataCallback);
}

function checkFav(query,response) {

    imgName = query.split("=");

    function dataCallback(err, tableData) {
    if (err) {
    console.log("error: ",err,"\n");
    } else {
        var fav = tableData.favorite;
        response.status(200);
        response.type("text/json");
        response.send("" + fav);
        }
    }

    db.get(
    'SELECT favorite FROM photoLabels WHERE fileName = ?',
    [imgName[1]],dataCallback);  
}

function favorite(query, response) {
    queryObj = querystring.parse(query);
    if (queryObj.op == "fav") {
        // console.log("favorite");
        var imageFile = queryObj.img;
        db.get('SELECT favorite FROM photoLabels WHERE filename =?', 
            [imageFile], getCallback);
        var favnum = 0;

        function getCallback(err, data) {
            if (err) {
                console.log("error: ",err,"\n");
            } else {
                if(data.favorite == 0){
                    db.run('UPDATE photoLabels SET favorite = ? WHERE fileName = ?',
                    [1, imageFile], updateCallback);
                    favnum = 1;
                } else if (data.favorite == 1){
                    db.run('UPDATE photoLabels SET favorite = ? WHERE fileName = ?',
                    [0, imageFile], updateCallback);
                    favnum = 0;
                }
            }
        }
        function updateCallback(err) {
            console.log("favorite "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");         
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("" + favnum);
                }
        }
    }    
}

function getAllImg(query,response) {
    queryObj = querystring.parse(query);
    if ( queryObj.op == "dump") {
         db.all('SELECT * FROM photoLabels', dataCallback);
    
        function dataCallback(err, tableData) {
        if (err) {
            console.log("error: ",err,"\n");
        } else {    
                if (tableData) {
                    response.status(200);
                    response.type("text/json");
                    response.send(tableData);
                } else {
                    sendCode(400,response,"requested photo not found");
                }
            }
        }
    }
}

function addLabel(query, response) {
    var flag = true;
        // query looks like: op=add&img=[image filename]&label=[label to add]
    queryObj = querystring.parse(query);
    if (queryObj.op == "add") {
        var newLabel = queryObj.label;
        var imageFile = queryObj.img;
        // console.log(imageFile);
        if (newLabel && imageFile) {
            // good add query
            console.log('good add query');
            // go to database! 
            db.get(
            'SELECT labels FROM photoLabels WHERE fileName = ?',
            [imageFile], getCallback);
            // define callback inside queries so it knows about imageFile
            // because closure!
            function getCallback(err,data) {
                // console.log("getting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    // good response...so let's update labels
                    var each = data.labels.split(', ');
                    for(var i = 0; i < each.length; i++) {
                        if(each[i] == newLabel){
                            flag = false;
                            // console.log('entere here');
                        }
                    }
                    if(flag == true) {
                        // console.log("did not get here");
                        if(data.labels != "") {
                            db.run(
                            'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                            [data.labels+", "+newLabel, imageFile],
                            updateCallback);
                        } else {
                            db.run(
                            'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                            [newLabel, imageFile],
                            updateCallback);
                        }
                    } else {
                        response.status(200);
                        response.type("text/plain");
                        response.send("found");
                    }
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallback(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");         
                } else {
                    if(flag == false){
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("found");
                    } else {
                    response.status(200);
                    response.type("text/plain");
                    response.send("not found");
                    }
                }
            }

        }
    }
}



function removeLabel(query, response) {
        // query looks like: op=remove&img=[image filename]&label=[label to add]
    queryObj = querystring.parse(query);
    if (queryObj.op == "remove") {
    // console.log('got here');
        var newLabel = queryObj.label;
        var imageFile = queryObj.img;
        if (newLabel && imageFile) {
            // good add query
            // go to database! 
            db.get(
            'SELECT labels FROM photoLabels WHERE fileName = ?',
            [imageFile], getCallback);

            // define callback inside queries so it knows about imageFile
            // because closure!
            function getCallback(err,data) {
                console.log("getting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    var each = data.labels.split(', ');
                    var combine = "";
                    var flag = true;
                    if(each[0] != newLabel) {
                        combine = each[0];
                        flag = false;
                    }
                    for(var i = 1; i < each.length; i++) {
                        if (each[i] != newLabel && flag == true) {
                            combine = combine + each[i];
                            flag = false;
                        } else if (each[i] != newLabel && flag == false) {
                            combine = combine + ", " + each[i];
                        }
                    }
                    // good response...so let's update labels
                    db.run(
                    'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                    [combine, imageFile],
                    updateCallback);
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallback(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");         
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("removed label "+newLabel+" to "+imageFile);
                }
            }

        }
    }
}

function findLabel(query,response) {
    // query looks like: op=filter&label=[label to find]
    queryObj = querystring.parse(query);
    if (queryObj.op == "filter") {
        var newLabel = queryObj.label;
        if(newLabel) {
            db.all('SELECT * FROM photoLabels', dataCallback);
    
            function dataCallback(err, tableData) {
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    var files = [];  
                    var eachlabel = [];
                    //var data = JSON.parse(tableData);
                    for(var i = 0; i < Object.keys(tableData).length; i++) {
                        eachlabel = tableData[i].labels.split(', ');
                        for(var j = 0; j < eachlabel.length; j++) {
                            if(eachlabel[j] == newLabel) {
                                files.push(tableData[i].fileName);
                                break;
                            }
                        }
                    }
                    if (files) {
                        response.status(200);
                        response.type("text/json");
                        response.send(files);
                    } else {
                            sendCode(400,response,"label not found");
                    }
                }
            }
        }
    }
}