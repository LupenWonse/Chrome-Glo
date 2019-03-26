function postCard(card) {
    var xhr = new XMLHttpRequest();
    
    return new Promise (function(resolve, reject){
        
        xhr.withCredentials = false;
        xhr.open("POST", "https://gloapi.gitkraken.com/v1/glo/boards/" + boardId + "/cards/?access_token=" + accessToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "98beb5ef-eff6-4980-92cd-66ca9834aea2");
        xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.responseText);
                }
        xhr.send(data); 
        });
    });
}

function addCard (click) {    
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