function postCard(card) {
    console.log("CARD");
    console.log(card);
    var xhr = new XMLHttpRequest();
    
    return new Promise (function(resolve, reject){
        
        xhr.withCredentials = false;
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log("RESOLVE");
            resolve(JSON.parse(xhr.responseText));
        }
        }); 
        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/?access_token=" + accessToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "98beb5ef-eff6-4980-92cd-66ca9834aea2");
        xhr.send(card); 
    });
}

function postAttachment(cardId, blob){
    var xhr = new XMLHttpRequest();
    
    return new Promise(function(resolve,reject){
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
              resolve(JSON.parse(xhr.responseText));
          }
        });
        
        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/"+cardId+"/attachments?access_token=" + accessToken);
        xhr.setRequestHeader("cache-control", "no-cache");
        var formData = new FormData();
        formData.append("attachment.png",blob,"attachment.png");
        xhr.send(formData);
    });          
}

function addCard (click) {
    var card = {};
    card.description = {};
    card.position = 0;
    card.column_id = click.menuItemId;
    
    var currentTab;
    var createdCardId;
    
    var promise = getCurrentTab().then(tab => {
        currentTab = tab;
        if (click.selectionText){
            card.name = click.selectionText;
        } else {
            card.name = currentTab.title;
        }
        card.description.text = " \n Created by Chrome Glo \n" + currentTab.url; 
    });
    
    if (click.mediaType == "image"){
        imageSource = click.srcUrl;
    } else {
        promise.then(getScreenshot)
        .then(function(dataURL){
            imageSource = dataURL;
        });
    }

    promise.then(function(){
        return postCard(JSON.stringify(card));
    })
    .then(function(responseData){
        console.log(responseData);
       createdCardId = responseData.id;
    })
    .then(function(){
        return getLocalData('shouldShowCard');
    })
    .then(function(shouldShowCard){
        if (shouldShowCard){
            chrome.tabs.create({"url": 'https://app.gitkraken.com/glo/board/' + boardId + '/card/' + createdCardId});
        }
    })
    .then(function(){
        return fetch(imageSource)
    })
    .then(res => res.blob())
    .then(function(blob){
        return postAttachment(createdCardId, blob);
    })
    .then(function(attachmentData){
        var comment = 'Card created by Glo Chrome extension \n';
        comment = comment + '[Original web-page](' + currentTab.url +')\n';
        comment = comment + '![image](' + attachmentData.url + ')';
        addComment(boardId, createdCardId, comment);
    })
    .catch(function(error){
        console.error("Add Card Failed : " + error);
    });
}

function addComment(boardIde, cardId, comment){
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