Array.prototype.contains = function (v) {
    return this.indexOf(v) > -1;
}

HTMLElement.prototype.appendFirst=function(childNode){
    if(this.firstChild)this.insertBefore(childNode,this.firstChild);
    else this.appendChild(childNode);
}

imgList = [];

function clearFilter() {
    removeAll();
    getAllImg();
}

// ============================= Favorite =======================
function addfavorite(imgName, imgIndex) {
    var url = "http://138.68.25.50:9430/query?fav="+imgName;

    function reqListener() {
        var text = document.getElementsByClassName("favorite")[imgIndex];
        if(oReq.responseText == "1") {
            text.textContent = "unfavorites";
        } else if (oReq.responseText == "0") {
            text.textContent = "add to favorites";
        }
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

function changeFav(index) {

    var image = document.getElementsByClassName("flickrPhoto");
    var select = image.length - index;
    var str = image[select].src;
    var imgName = str.split('/').pop();

    var url = "http://138.68.25.50:9430/query?op=fav&img=" + imgName;

    function reqListener () {
        var fav = document.getElementsByClassName("favorite")[select];
        if (this.responseText == "1") {
            fav.textContent = "unfavorites";
        } else {
            fav.textContent = "add to favorites";
        }
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

function findFav(){
    var fav = document.getElementsByClassName("favorite");
    var photos = document.getElementsByClassName("photoContainer");
    for(var i = 0; i < fav.length; i++) {
        if(fav[i].textContent == "add to favorites") {
            photos[i].style.display = "none";
        }
    }
}

// ======================= Add Remove Labels Images =======================
function getAllImg() {
    var url = "http://138.68.25.50:9430/query?op=dump";
    function reqListener () {
        var obj = JSON.parse(this.responseText);
        for(var j = 0; j < Object.keys(obj).length; j++) {
            newContainer(obj[j].fileName);
            imgList.push(obj[j].fileName);
            addfavorite(obj[j].fileName, Object.keys(obj).length-j-1);
            triangle();
            menu();
        }
        var pic = document.getElementsByClassName("flickrPhoto");
        for(var i = 0; i < pic.length; i++) {
            pic[i].style.opacity = 1;
        }
        getLabels();
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

function getLabels() {
    var img = document.getElementsByClassName('flickrPhoto');
    var imgLength = img.length;

    for (var i = 0; i < imgLength; i++) {
        var filename = img[i].src.split('/').pop();
        geteachLabels(filename, i);
    }
}

function removeAll() {
    var container = document.getElementsByClassName("photoContainer");
    var len = container.length;
    for(var i = 0; i < len; i++) {
        container[0].parentNode.removeChild(container[0].parentNode.firstChild);
    }
}

function removeLabelFnt(index, imgIndex) {
    var image = document.getElementsByClassName("flickrPhoto");
    var newIndex = image.length - imgIndex;
    var str = image[newIndex].src;
    var imgName = str.split('/').pop();

    var tags = document.getElementsByClassName("tagbox");
    var label = tags[newIndex].childNodes[index].textContent;


    var url = "http://138.68.25.50:9430/query?op=remove&img=" + imgName + "&label=" + label;
    // console.log(url);
    function reqListener () {
        var image = document.getElementsByClassName("flickrPhoto");
        var x = document.getElementsByClassName("delete"+imgIndex);
        
        for(var j = index; j < x.length-1; j++) {
            var removeLabel = "removeLabelFnt(" + j + ", " + imgIndex + ")";
            x[j+1].setAttribute( "onClick", removeLabel);
        }
        var box = tags[newIndex];
        box.removeChild(box.childNodes[index]);
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

//display exisiting labels individual img
function geteachLabels(imgName, index) {

        // construct url for query
    var url = "http://138.68.25.50:9430/query?img="+imgName;

        // becomes method of request object oReq
        //get tags
    function reqListener () {
        var tags = this.responseText.split(', ');
        var tagLength = tags.length;
        var img = document.getElementsByClassName("tagContainer");
        var newIndex = img.length - index;
        for (var i = 0; i < tagLength; i++) {
            if(tags[i] != "") {
            var innerBox = document.createElement("div");
            innerBox.className = "labelbox";
            innerBox.style.display = "inline-block";

            var x = document.createElement("img");
            x.className = "delete" + newIndex;
            x.style.width = "15px";
            x.src = "../photobooth/removeTagButton.png";
            x.style.display = 'none';
            var removeLabel = "removeLabelFnt(" + i + ", " + newIndex + ")";
            x.setAttribute( "onClick", removeLabel);

            var line = document.createElement("p");
            line.className = "labels";
            line.innerHTML = tags[i];

            var outBox = document.getElementsByClassName('tagbox')
            innerBox.appendChild(x);
            innerBox.appendChild(line);

            outBox[index].appendChild(innerBox)
            }
        }
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

function apiLabel(labels) {
    var tags = labels.split(', ');
    var tagLength = tags.length;

    for (var i = 0; i < tagLength; i++) {
        if(tags[i] != "") {
        var innerBox = document.createElement("div");
        innerBox.className = "labelbox";
        innerBox.style.display = "inline-block";

        var photo = document.getElementsByClassName("photoContainer");

        var x = document.createElement("img");
        x.className = "delete" + photo.length;
        x.style.width = "15px";
        x.src = "../photobooth/removeTagButton.png";
        x.style.display = 'none';
        var removeLabel = "removeLabelFnt(" + i + ", " + photo.length + ")";
        x.setAttribute( "onClick", removeLabel);

        var line = document.createElement("p");
        line.className = "labels";
        line.innerHTML = tags[i];

        var outBox = document.getElementsByClassName('tagbox')
        innerBox.appendChild(x);
        innerBox.appendChild(line);

        outBox[0].appendChild(innerBox)
        }
    }
}

function test(name){
    geteachLabels(name,0);
}
// uploads an image within a form object.
function uploadFile() {
    var url = "http://138.68.25.50:9430";

    // where we find the file handle
    var selectedFile = document.getElementById('fileSelector').files[0];
    var formData = new FormData();
    var fileName = document.getElementById('fileName');

    fileName.textContent = "No file chosen";
    // stick the file into the form
    formData.append("userfile", selectedFile);

    // more or less a standard http request
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.onload = function() {

    var labelStatus = oReq.responseText.split('=');
    if(labelStatus[0] === "recieved file" && show == false) {
        var progressBar = document.querySelector('progress');
        progressBar.style.display = "none";
        document.getElementsByClassName("triangle")[0].style.display = "block";
        document.getElementsByClassName("photoContainer")[0].childNodes[1].style.display = "block";
        document.getElementsByClassName("favorite")[0].textContent = "add to favorites";
        triangle();
        menu();
        var image = document.getElementsByClassName("flickrPhoto");
        var imgLength = image.length;
        image[0].src = selectedFile.name;
        image[0].style.opacity = 1;
        apiLabel(labelStatus[1]);
    } else {
        alert("File already exists.");
    }
    }

    var show = imgList.contains(selectedFile.name);
    if( show == false){
        imgList.push(selectedFile.name);
        readFile();
    }

    oReq.upload.onprogress = function(e) {
        var progressBar = document.querySelector('progress');
        if (e.lengthComputable && progressBar != null) {
            progressBar.value = parseInt((e.loaded / e.total) * 100);
            progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
        }
    };
    oReq.send(formData);
}

//display fade
function readFile() {
    var selectedFile = document.getElementById('fileSelector').files[0];
    // var image = document.getElementById('theImage');

    var fr = new FileReader();
    // anonymous callback uses file as image source
    fr.onload = function () {
        newContainer(fr.result);
        createProgress();
        document.getElementsByClassName("triangle")[0].style.display = "none";
    };
    fr.readAsDataURL(selectedFile);    // begin reading

}

function createProgress() {
    var bar = document.createElement('progress');
    bar.min = "0";
    bar.max = "100";
    bar.value = "0";
    bar.style.display = "block";
    bar.textContent = "0% Complete";
    var contain = document.getElementsByClassName("photoContainer")[0];
    contain.childNodes[1].style.display = "none";
    contain.appendChild(bar);
}

// create a new photocontainer
function newContainer(name){
    // ******* create new container ********
    var pcontainer = document.getElementsByClassName("photoContainer");
    var plength = pcontainer.length;
    var new_class = document.createElement("div");
    new_class.className = "photoContainer";
    var flex = document.createElement("div");
    flex.className = "flexy";
    //uploaded photo
    var img = document.createElement("img");
    img.className = "flickrPhoto";
    img.src = name;
    img.style.opacity = 0.5;
    //triangle
    var tri = document.createElement("img");
    tri.className = "triangle";
    var index = plength + 1;
    // tri.id = "triangle" + index;
    tri.id = "triangle2";
    tri.src = "../photobooth/optionsTriangle.png";
    var fnt = "showmenu(" + index + ");";
    tri.setAttribute( "onClick", fnt );
    flex.appendChild(img);
    flex.appendChild(tri);

    var check = "checkTags(" + index +");";
    new_class.setAttribute( "onmouseover", check);
    //menu
    var menu = document.createElement("div");
    menu.className = "menu";
    var change = document.createElement("h4");
    change.className = "change-tag hamburger-style";
    change.textContent = "change tags";
    var changeTagFnt = "changeTag(" + index + ");";
    change.setAttribute( "onClick", changeTagFnt);
    //fav
    var fav = document.createElement("h4");
    fav.className = "favorite hamburger-style"
    fav.textContent = "";
    var favTagFnt = "changeFav(" + index + ");";
    fav.setAttribute( "onClick", favTagFnt);
    //empty
    var empty = document.createElement("p");
    empty.className = "empty";
    menu.appendChild(change);
    menu.appendChild(fav);
    menu.appendChild(empty);
    flex.appendChild(menu);

    var tagContainer = document.createElement("div");
    tagContainer.className = "tagContainer";

    // tagbox
    var tag = document.createElement("div");
    tag.className = "tagbox";
    tag.style.backgroundColor = "white";

    var newTag = document.createElement("input");
        newTag.className = "newTag";
        newTag.placeholder= "Enter New Tag";
        newTag.name = "newTag";
        newTag.style.display = "none";

    tagContainer.appendChild(tag);
    tagContainer.appendChild(newTag);

    new_class.appendChild(flex);
    new_class.appendChild(tagContainer);

    // append to main
    var main = document.querySelector("main");
    main.appendFirst(new_class);

    //**** set opacity
    var image2 = document.getElementsByClassName("flickrPhoto");
    var imgLength2 = image2.length;
    image2[0].style.opacity = 0.5;

    var addBtn = document.createElement("div");
    addBtn.className = "addBtn"
    addBtn.style.display = 'block';
    addBtn.textContent = "Add";
    addBtn.style.display = "none";

    var newTagFnt = "newTag(" + index + ");";
    addBtn.setAttribute( "onClick", newTagFnt);

    new_class.appendChild(addBtn);
}


function changeTag(index) {
    var tagBox = document.getElementsByClassName("tagbox");
    var select = tagBox.length - index;
    var name = "delete" + index;
    var del = document.getElementsByClassName(name);

    if(tagBox[select].style.backgroundColor == "white") {
        tagBox[select].style.backgroundColor = "#C9BAB0";
    } else {
        tagBox[select].style.backgroundColor = "white";
    }

    var newTag = document.getElementsByClassName("newTag");
    if(newTag[select].style.display == "none") {
            newTag[select].style.display = "inline";
        } else {
            newTag[select].style.display = "none";
        }

    var addBtn = document.getElementsByClassName('addBtn');
    if(addBtn[select].style.display == "none") {
            addBtn[select].style.display = "inline";
        } else {
            addBtn[select].style.display = "none";
        }

    for (var i = 0; i < del.length; i++){
        if(del[i].style.display == "none" || del[i].style.display == "" ) {
            del[i].style.display = "inline";
        } else {
            del[i].style.display = "none";
        }
    }
}

function newTag(index){
    var img = document.getElementsByClassName('flickrPhoto');
    var imgName = img[img.length - index].src.split('/').pop();

    var newTag = document.getElementsByClassName("newTag");
    var label = newTag[img.length - index].value;

    addLabels(imgName, label, img.length - index);
}


function addLabels(imgName, label, index) {
// function addLabels() {

    var url = "http://138.68.25.50:9430/query?op=add&img=" + imgName + "&label=" + label;
    // var url = "http://138.68.25.50:9430/query?op=add&img=noFace.jpg&label=This is New Label";
    function reqListener () {
        var img = document.getElementsByClassName('flickrPhoto');
        var fntIndex = img.length - index;
        console.log(fntIndex);
        console.log(this.responseText);
        if(this.responseText == "not found") {
        var tags = document.getElementsByClassName("tagbox");
        var innerBox = document.createElement("div");
        var l = tags[index].querySelectorAll('.labels').length;
        innerBox.className = "labelbox";
        innerBox.style.display = "inline-block";

        var x = document.createElement("img");
        x.className = "delete" + fntIndex;
        x.style.width = "15px";
        x.src = "../photobooth/removeTagButton.png";
        x.style.display = 'inline';
        var removeLabel = "removeLabelFnt(" + l + ", " + fntIndex + ")";
        x.setAttribute( "onClick", removeLabel);

        var line = document.createElement("p");
        line.className = "labels";
        line.innerHTML = label;

        var outBox = document.getElementsByClassName('tagbox')
        innerBox.appendChild(x);
        innerBox.appendChild(line);

        outBox[index].appendChild(innerBox);
        } else if(this.responseText == "found") {
            alert("Label already exists.");
        }
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

function checkTags(index){
    var tagBox = document.getElementsByClassName("tagbox");
    var len = tagBox.length - index;
    var addBtn = document.getElementsByClassName('addBtn');
    var labelsLen = tagBox[len].querySelectorAll('.labelbox').length;
    if (labelsLen >= 10){
        addBtn[len].style.backgroundColor = "#d3d3d3";
        addBtn[len].style.pointerEvents = 'none';
    } else {
        addBtn[len].style.backgroundColor = "#885540";
        addBtn[len].style.pointerEvents = 'auto';
    }
}
// ============================= Side Bar =======================
function changeFileName() {
    var selectedFile = document.getElementById('fileSelector').files[0];
    var fileName = document.getElementById('fileName');

    if(selectedFile != null) {
        fileName.textContent = selectedFile.name;
    } else {
        fileName.textContent = "No file chosen";
    }
}


function openTop () {
    var open = document.getElementById('open');

    if ( open.style.display === "" || open.style.display === "none"){
        open.style.display = "block";
    } else {
        open.style.display = "none";
    }
}

function openMid () {
    var detail = document.getElementById('detail');

    if (detail.style.display === "" || detail.style.display === "none"){
        detail.style.display = "block";
    } else {
        detail.style.display = "none";
    }
}


function openBottom () {
    var open = document.getElementById('open-fav');

    if ( open.style.display === "" || open.style.display === "none"){
        open.style.display = "block";
    } else {
        open.style.display = "none";
    }
}

function findTag() {

    var label = document.getElementsByClassName("textarea")[0].value;
    console.log(label);
    var url = "http://138.68.25.50:9430/query?op=filter&label=" + label;

    function reqListener () {
        removeAll();
        var array = JSON.parse(this.responseText);
        var img = document.getElementsByClassName("flickrPhoto");
        for(var i = 0; i < array.length; i++) {
            // img = document.getElementsByClassName("flickrPhoto");
            console.log(array[i]);
            newContainer(array[i]);
            img[0].style.opacity = 1;
            triangle();
            menu();
            geteachLabels(array[i],array.length-1-i);
        }
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();

}

//================== triangle ====================================
function triangle () {
    var img = document.getElementsByClassName('flickrPhoto');
    var imgLength = img.length;
    var triangle = document.getElementsByClassName('triangle');
    for (var i = 0; i < imgLength; i++) {
        var width = img[i].clientWidth;
        var height = img[i].clientHeight;

        var top = triangle[i].style.top;
        top = height-58;
        triangle[i].style.top = top + "px";

        var left = triangle[i].style.left;
        left = width-57;
        triangle[i].style.left = left + "px";
    }
}
function menu() {
    var img = document.getElementsByClassName('flickrPhoto');
    var imgLength = img.length;
    var menu = document.getElementsByClassName('menu');
    for (var i = 0; i < imgLength; i++) {
        var width = img[i].clientWidth;
        var height = img[i].clientHeight;

        var top = menu[i].style.top;
        top = height-121;
        menu[i].style.top = top + "px";

        var left = menu[i].style.left;
        left = width-122;
        menu[i].style.left = left + "px";
    }
}

function showmenu(index) {
    // var triangle = document.getElementsByClassName('triangle');
    console.log(index);
    var menu = document.getElementsByClassName('menu');
    var newIndex = menu.length - index;
    var back = document.getElementsByClassName("tagbox");
    var newtag = document.getElementsByClassName("newTag");
    var btn = document.getElementsByClassName("addBtn");
    
    console.log(newIndex);
    for (var i = 0; i < menu.length; i++){
        if(menu[i].style.display == "block" && i != newIndex){
            menu[i].style.display = "none";
            var close2 = document.getElementsByClassName("delete"+ (menu.length - i));
            console.log(close2);
            for(var j = 0; j < close2.length; j++) {
                if(close2[j].style.display == "inline") {
                    close2[j].style.display = "none";
                }
            }
            if (back[i].style.backgroundColor != "white") {
                back[i].style.backgroundColor = "white";
                newtag[i].style.display = "none";
                btn[i].style.display = "none";
            }
        }
    }

    if (menu[newIndex].style.display == "none" || menu[newIndex].style.display == "" ) {
            menu[newIndex].style.display = "block";
        } else {
            var close = document.getElementsByClassName("delete"+ index);
            for(var j = 0; j < close.length; j++) {
                if(close[j].style.display == "inline") {
                    close[j].style.display = "none";
                }
            }
            if (back[newIndex].style.backgroundColor != "white") {
                back[newIndex].style.backgroundColor = "white";
                newtag[newIndex].style.display = "none";
                btn[newIndex].style.display = "none";
            }
            menu[newIndex].style.display = "none";
    }
}
