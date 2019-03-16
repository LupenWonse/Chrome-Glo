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

chrome.contextMenus.create({"title" : "Add to GloBoard", "contexts" : ["selection"], onclick : addToFirstBoard}, function (){
        console.log("Context menu added");
});

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
            return true;
        }
        return false;
    });
}

console.log(isUserLoggedIn());