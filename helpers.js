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
            if (result[key] != undefined){
                resolve (result[key]);
            } else {
                reject(key + ' not found in storage');
            }
        });
    });
}

function getScreenshot(format = 'png'){
    return new Promise(function(resolve,reject){
        chrome.tabs.captureVisibleTab(undefined,{"format" : format},function(dataURL){
            resolve(dataURL);
        });
    });
}

function getCurrentTab(){
    return new Promise(function(resolve,reject){
        chrome.tabs.query({"active" : true, "currentWindow" : true}, function(tab){
            resolve(tab[0]);
        });
    });
}