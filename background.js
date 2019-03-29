chrome.runtime.onInstalled.addListener(function(){
    setLocalData({'shouldShowCard' : false})
        .then(startLogin);
})

var loginTabId;
var currentBoardIndex = 0;

// Start extension
    const clientId = "aajdmgmjv5myynpbkgcg";
    var boardId = "";
    var accessToken = null;
    var boards = null;

    isUserLoggedIn(); // If yes this will load the boards


function startLogin(){
    chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id=aajdmgmjv5myynpbkgcg&scope=board:write&state=qwert12345'},function(tab){
                loginTabId = tab.id;
            });
}

function logout(){
    chrome.storage.local.remove('access_token',function(){
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
            requestBoards().then(function(request){
                return JSON.parse(request.responseText);
            }).then(function(json){
                boards = json;
                chrome.storage.local.set({'boards' : boards});
            })
        }
        else {
            console.error("Message failed : " + request);
        }
    }
)

// Check for user authentication
function isUserLoggedIn() {
    getLocalData('access_token')
    .then(function(token){
        //console.log("Found Token : " + token);
        accessToken = token;
        return setLocalData({"accessToken" : token});
    })
    .then(requestBoards)
    .then(function(request){
        var json = JSON.parse(request.responseText);
        return setLocalData({'boards':json});
    })
    .then(function(data){
        boards = data.boards;
        return getLocalData('currentBoardIndex');
    })
    .then(function(currentBoardIndex){
        return selectBoard(currentBoardIndex);
    },function(){
        return selectBoard(0);
    })
    .then(function(){
        createMenus();
        enableSwitcher();
    })
    .catch(function(reason){
        accessToken = undefined;
        doLogOut();
        console.error(reason);
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
        getAccessToken(params.get('code'));
        chrome.tabs.remove(loginTabId, function(){
            //console.log("Removing Tab : " + loginTabId);
            loginTabId = undefined;
        });
    }    
}

// =========
// Initialization based on auth state
function createMenus() {
    //console.log("Enabling All Context Menus");
    chrome.contextMenus.removeAll();
    var id = chrome.contextMenus.create({"title" : "New Glo Card", "contexts" : ["all"]});
    chrome.contextMenus.create({"title" : boards[currentBoardIndex].name, "type" : "normal","parentId" : id,"contexts" : ["all"],'enabled' : false ,"onclick": showBoard});
    chrome.contextMenus.create({"type" : "separator","parentId" : id,"contexts" : ["all"]});
    for (let column of boards[currentBoardIndex].columns){
        chrome.contextMenus.create({"title" : column.name , "type" : "normal","parentId" : id,"id" : column.id, "contexts" : ["all"],"onclick" : addCard});
    }
    chrome.contextMenus.create({"type" : "separator","parentId" : id,"contexts" : ["all"]});
    chrome.contextMenus.create({"title" : 'Open ' + boards[currentBoardIndex].name + ' in Glo', "type" : "normal","parentId" : id,"contexts" : ["all"],'enabled' : true ,"onclick": showBoard});
    
}

function showBoard() {
    chrome.tabs.create({"url" : 'https://app.gitkraken.com/glo/board/' + boards[currentBoardIndex].id});
}

function doLogOut() {
    //console.log("Disabling Context Menus");
    chrome.browserAction.setPopup({"popup" : "login.html"});
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title" : "Login to Glo Board", "contexts" : ["all"], "onclick" : function () {
        startLogin();
        }
    });
}

// ======================
// Context Menu Callbacks


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

// ==========
// Basic API calls
function selectBoard(boardIndex){
    currentBoardIndex = boardIndex;
    return setLocalData({currentBoardIndex : boardIndex})
    .then(function(){
        boardId = boards[currentBoardIndex].id;
    });
    
}

function enableSwitcher(){
    chrome.browserAction.setPopup({"popup" : "boardSwitch.html"});
}


   
function getAccessToken (code){
        // Build Http Request For Access Token
        const Http = new XMLHttpRequest();
        const httpUrl='https://api.gitkraken.com/oauth/access_token';
        var data = "grant_type=authorization_code&client_id=aajdmgmjv5myynpbkgcg&client_secret=dc9ejktj6c4535o5bpzcoxlcs1nfzjjqqss0oqu0&code=" + code;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            //console.log(JSON.parse(this.responseText));
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

