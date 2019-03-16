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
    chrome.contextMenus.create({"title" : "Add to Glo Board", "contexts" : ["selection"], onclick : addToFirstBoard});
}

function doLogOut() {
    console.log("Disabling Context Menus");
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title" : "Login to Glo Board", "onclick" : function () {
        chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id=aajdmgmjv5myynpbkgcg&scope=board:write&state=qwert12345'});
        }
    });
}

isUserLoggedIn();