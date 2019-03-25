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