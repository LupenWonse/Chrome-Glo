// Check for user authentication
function isUserLoggedIn() {
    chrome.storage.local.get(['access_token'], function(result){
        if (result.access_token) {
            console.log('User is logged in');
            accessToken = result.access_token;
            doLogIn();
        } else {
            console.log('User is not logged in');
            doLogOut();
        }
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
        chrome.tabs.update({url: '/userIdentified.html' + "?code=" + params.get('code')});
    }    
}

// =========
// Initialization based on auth state
function doLogIn() {
    console.log("Enabling All Context Menus");
    
    loadBoards();
    
    chrome.contextMenus.removeAll();

    var id = chrome.contextMenus.create({"title" : "Glo Boards", "contexts" : ["all"]});
    chrome.contextMenus.create({"title" : "Create card from current page", "contexts" : ["all"], "parentId" : id, "onclick" : addCard});
    chrome.contextMenus.create({"title" : "Add to Glo Board", "contexts" : ["selection"], "parentId" : id, "onclick" : addCard});
}

function doLogOut() {
    console.log("Disabling Context Menus");
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title" : "Login to Glo Board", "onclick" : function () {
        chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id' + clientId + '=&scope=board:write&state=qwert12345'});
        }
    });
}

// ======================
// Context Menu Callbacks

var addCard = function () {
    chrome.tabs.query({"active" : true, "currentWindow" : true}, function(tab){
        console.log(tab);
        var tabTitle = tab[0].title;
        var tabUrl = tab[0].url;
        
         var data = JSON.stringify({
        "name": tabTitle,
        "position": 0,
        "column_id": "5af065eb4f33b715001428c3"
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = false;

        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            console.log(this.responseText);
          }
        });

        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/?access_token=" + accessToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "98beb5ef-eff6-4980-92cd-66ca9834aea2");

        xhr.send(data); 
    });
}
   
var addToFirstBoard = function (details){
    console.log(details.selectionText);
}

// ==========
// Basic API calls

function loadBoards() {
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
          boards = JSON.parse(this.responseText);
          chrome.storage.local.set({'boards' : boards});
      }
    });

    xhr.open("GET", "https://gloapi.gitkraken.com/v1/glo/boards?access_token=" + accessToken + "&fields[]=name&fields[]=columns");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "0978eded-d46d-4397-b16e-c2a8692763ea");

    xhr.send(data);
}    


// Start extension
    const clientId = "aajdmgmjv5myynpbkgcg";
    var boardId = "5af065e94f33b715001428bd";
    var columnId = "5af065eb4f33b715001428c3";
    var accessToken = null;
    var boards = null;

    isUserLoggedIn(); // If yes this will load the boards

   
