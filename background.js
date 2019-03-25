var userIdentificationCode;
var loginTabId;
var currentBoardIndex = 0;


function startLogin(){
    chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id=aajdmgmjv5myynpbkgcg&scope=board:write&state=qwert12345'},function(tab){
                loginTabId = tab.id;
                console.log("Created Tab : " + tab.id);
            });
}

function logout(){
    chrome.storage.local.remove('access_token',function(){
       console.log("Removed");
        isUserLoggedIn(); 
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse){
        if (request.type == "startLogin"){
            startLogin();
        } else if (request.type == "logout"){
            logout();
        }
        else if (request.type == "selectBoard"){
            // Board changed
            selectBoard(request.index);
            createMenus();
        }
        else if (request.type == "updateBoards"){
            updateBoards();
        }
        else {
            console.log("Message failed");
            console.log(request);
        }
    }
)

// Check for user authentication
function isUserLoggedIn() {
    getLocalData('access_token')
    .then(function(token){
        console.log("Found Token : " + token);
        accessToken = token;
        return setLocalData({"accessToken" : token});
    },function(reason){
        accessToken = undefined;
        doLogOut();
        return Promise.reject(reason);
    }).then(requestBoards)
    .then(function(request){
        var json = JSON.parse(request.responseText);
        return setLocalData({'boards':json});
    })
    .then(function(data){
        boards = data.boards;
        selectBoard(0);
        createMenus();
        enableSwitcher();
    })
    .catch(function(reason){
        console.log(reason);
    });
}

chrome.webRequest.onBeforeRequest.addListener(redirectToExtension,{
        urls: [
            "*://app.gitkraken.com/*"
        ]
    });

function redirectToExtension (details) {
    const url = new URL(details.url);
    const params = new URLSearchParams(url.search);
    window.location.href = 'chrome-extension://index.html';
    
    if(params.has('code')){
        userIdentificationCode = params.get('code');
        getAccessToken(params.get('code'));
        chrome.tabs.remove(loginTabId, function(){
            console.log("Removing Tab : " + loginTabId);
            loginTabId = undefined;
        });
    }    
}

// =========
// Initialization based on auth state
function createMenus() {
    console.log("Enabling All Context Menus");
    chrome.contextMenus.removeAll();

    var id = chrome.contextMenus.create({"title" : "Glo Boards", "contexts" : ["all"]});
    chrome.contextMenus.create({"title" : boards[currentBoardIndex].name, "type" : "normal","parentId" : id,"contexts" : ["all"],"onclick": showBoard});
    chrome.contextMenus.create({"type" : "separator","parentId" : id,"contexts" : ["all"]});
    for (let column of boards[currentBoardIndex].columns){
        chrome.contextMenus.create({"title" : "Create New Card in " + column.name, "type" : "normal","parentId" : id,"id" : column.id, "contexts" : ["all"],"onclick" : addCard});
    }
    
}

function showBoard() {
    chrome.tabs.create({"url" : 'https://app.gitkraken.com/glo/board/' + boards[currentBoardIndex].id});
}

function doLogOut() {
    console.log("Disabling Context Menus");
    chrome.browserAction.setPopup({"popup" : "login.html"});
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title" : "Login to Glo Board", "onclick" : function () {
        startLogin();
        }
    });
}

// ======================
// Context Menu Callbacks

var addCard = function (click) {
    
    chrome.tabs.captureVisibleTab(undefined,{"format" : 'png'},function(dataURL){
        chrome.tabs.query({"active" : true, "currentWindow" : true}, function(tab){
            // Image source to be captured
            var imageSource;
            
            // Set card properties
            var card = {};
            card.description = {};
            card.position = 0;
            card.column_id = click.menuItemId;
            
            if (click.selectionText){
                card.name = click.selectionText;
            } else {
                card.name = tab[0].title;
            }
            
            if (click.mediaType == "image") {
                imageSource = click.srcUrl; 
            } else {
                imageSource = dataURL;
            }
            
            card.description.text = " \n Created by Chrome Glo \n" + tab[0].url;
            //var tabUrl = tab[0].url;
        
            var data = JSON.stringify(card);

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.addEventListener("readystatechange", function () {
                
                if (this.readyState === 4) {
                    console.log(this.responseText);
                    var responseData = JSON.parse(this.responseText);
                    var createdCardId = responseData.id;

                    var xhr = new XMLHttpRequest();

                    xhr.addEventListener("readystatechange", function () {
                      if (this.readyState === 4) {
                        var attachmentData = JSON.parse(this.responseText);
                          console.log(this.responseText);
                          console.log (attachmentData);
                          var comment = 'Card created by Glo Chrome extension \n';
                          comment = comment + '[Original web-page](' + tab[0].url +')\n';
                          comment = comment + '![image](' + attachmentData.url + ')';
                          addComment(boardId, createdCardId, comment);
                      }
                    });

                    xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/"+createdCardId+"/attachments?access_token=" + accessToken);
                    xhr.setRequestHeader("cache-control", "no-cache");
                    xhr.setRequestHeader("Postman-Token", "39e902ee-3568-44c6-967f-a1563e26ff62");

// Generate blob from the screenshot dataURL
                    fetch(imageSource)
                    .then(res => res.blob())
                    .then(blob => {
                        console.log("BLOB");
                        console.log(blob);
                        var formData = new FormData();
                        formData.append("test.png",blob,"test.png");
                        xhr.send(formData);
                    });
                }
                });

        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/?access_token=" + accessToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "98beb5ef-eff6-4980-92cd-66ca9834aea2");
        xhr.send(data); 
        
        });
    });
}

var addComment = function(boardId, cardId, comment){
    console.log("Adding Comment : To Board : " + boardId + " to Card: " + cardId + " : " + comment);
    
    var commentData = {text: comment};
    
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            var attachmentData = JSON.parse(this.responseText);
            console.log("Adding Comment:");
            console.log(this.responseText);
        }
    });
    
        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/" + cardId+ "/comments/?access_token=" + accessToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "98beb5ef-eff6-4980-92cd-66ca9834aea2");
    console.log(commentData);
        xhr.send(JSON.stringify(commentData));
}

// Promise Based XHR Calls
function requestBoards(){
    var xhr = new XMLHttpRequest();
    
    return new Promise(function(resolve,reject){
        xhr.addEventListener("readystatechange", function () {
          if (xhr.readyState === 4) {
              resolve(xhr);
            }
        });

        xhr.open("GET", "https://gloapi.gitkraken.com/v1/glo/boards?access_token=" + accessToken + "&fields[]=name&fields[]=columns");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "0978eded-d46d-4397-b16e-c2a8692763ea");
        xhr.send();
    });
}

function setLocalData(object){
    return new Promise(function(resolve,reject){
       chrome.storage.local.set(object,function(){
           resolve(object);
       }) 
    });
}

function getLocalData(key){
    return new Promise(function(resolve,reject){
        chrome.storage.local.get(key,function(result){
            if (result[key]){
                resolve (result[key]);
            } else {
                reject(key + ' not found in storage');
            }
        });
    });
}




// ==========
// Basic API calls

function updateBoards(){
    console.log("Updating");
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
          boards = JSON.parse(this.responseText);
          
          chrome.storage.local.set({'boards' : boards});
          console.log(boards);
      }
    });

    xhr.open("GET", "https://gloapi.gitkraken.com/v1/glo/boards?access_token=" + accessToken + "&fields[]=name&fields[]=columns");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "0978eded-d46d-4397-b16e-c2a8692763ea");

    xhr.send(data);
}

function selectBoard(boardIndex){
  // TODO Replace this with defaults
    console.log("Board is now " + boardIndex);
    console.log(boards[currentBoardIndex]);
    currentBoardIndex = boardIndex;      
    boardId = boards[currentBoardIndex].id;
}

function enableSwitcher(){
    chrome.browserAction.setPopup({"popup" : "boardSwitch.html"});
}


// Start extension
    const clientId = "aajdmgmjv5myynpbkgcg";
    var boardId = "";
    var accessToken = null;
    var boards = null;

    isUserLoggedIn(); // If yes this will load the boards

   
function getAccessToken (code){
        // Build Http Request For Access Token
        const Http = new XMLHttpRequest();
        const httpUrl='https://api.gitkraken.com/oauth/access_token';
        var data = "grant_type=authorization_code&client_id=aajdmgmjv5myynpbkgcg&client_secret=dc9ejktj6c4535o5bpzcoxlcs1nfzjjqqss0oqu0&code=" + code;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(JSON.parse(this.responseText));
            var results = JSON.parse(this.responseText);
            chrome.storage.local.set(results, function(){
                isUserLoggedIn();
            });
        }
        });

        xhr.open("POST", "https://api.gitkraken.com/oauth/access_token?grant_type=authorization_code");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "6c9895b2-01cb-456c-9871-8dca069caf1f");
        xhr.send(data);
}
