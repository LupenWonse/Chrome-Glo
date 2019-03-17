var callback = function (details) {
    const url = new URL(details.url);
    const params = new URLSearchParams(url.search);
    window.location.href = 'chrome-extension://index.html';
    
    if(params.has('code')){
        chrome.tabs.update({url: '/userIdentified.html' + "?code=" + params.get('code')});
    }    
}

var addToFirstBoard = function (details){
    console.log(details.selectionText);
}



chrome.webRequest.onBeforeRequest.addListener(callback,{
        urls: [
            "*://app.gitkraken.com/*"
        ]
    }
        );

// Check for user authentication
function isUserLoggedIn() {
    chrome.storage.local.get(['access_token'], function(result){
        if (result.access_token) {
            console.log('User is logged in');
            console.log(result.access_token);
            doLogIn();
        } else {
            doLogOut();
        }
    });
}

function doLogIn() {
    console.log("Enabling All Context Menus");
    chrome.contextMenus.removeAll();

    var id = chrome.contextMenus.create({"title" : "Glo Boards", "contexts" : ["all"]});
    chrome.contextMenus.create({"title" : "Create card from current page", "contexts" : ["all"], "parentId" : id, "onclick" : addCard});
    chrome.contextMenus.create({"title" : "Add to Glo Board", "contexts" : ["selection"], "parentId" : id, "onclick" : addCard});
}

function doLogOut() {
    console.log("Disabling Context Menus");
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title" : "Login to Glo Board", "onclick" : function () {
        chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id=aajdmgmjv5myynpbkgcg&scope=board:write&state=qwert12345'});
        }
    });
}

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
   
    
    isUserLoggedIn();
    var boardId = "5af065e94f33b715001428bd";
    var columnId = "5af065eb4f33b715001428c3";
    var accessToken = "5ffdfd920840f76d41b58d377c88850079311e2b";
    
   
}