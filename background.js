var callback = function (details) {
    const url = new URL(details.url);
    const params = new URLSearchParams(url.search);
    window.location.href = 'chrome-extension://index.html';
    
    if(params.has('code')){
        chrome.tabs.update({url: 'chrome-extension://jgfikdjkeepfomjoeoojhjgnkpakcdmp/userIdentified.html' + "?code=" + params.get('code')});
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

// OnClick Listener for the browserAction button
//  chrome.browserAction.onClicked.addListener(function() {
//    chrome.tabs.create({url: 'index.html'});
//  });

// Check for user authentication
function isUserLoggedIn() {
    chrome.storage.local.get(['access_token'], function(result){
        if (result) {
            console.log('User is logged in');
            return true;
        }
        return false;
    });
}

console.log(isUserLoggedIn());