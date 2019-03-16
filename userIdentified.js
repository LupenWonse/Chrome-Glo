window.onload = function() {
    // Get the code from URL
    chrome.tabs.getCurrent(function (tab){
        const url = new URL(tab.url);
        const params = new URLSearchParams(url.search);
        var code = params.get('code');
        
        // Build Http Request For Access Token
        const Http = new XMLHttpRequest();
        const httpUrl='https://api.gitkraken.com/oauth/access_token';
        var data = "grant_type=authorization_code&client_id=aajdmgmjv5myynpbkgcg&client_secret=dc9ejktj6c4535o5bpzcoxlcs1nfzjjqqss0oqu0&code=" + code;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(JSON.parse(this.responseText));
            var results = JSON.parse(this.responseText);
            chrome.storage.local.set(results, function(){
                chrome.storage.local.get(['access_token'], function(result){
                    console.log ("Result : " + result.access_token);
                })
            });
        }
        });

        xhr.open("POST", "https://api.gitkraken.com/oauth/access_token?grant_type=authorization_code");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "6c9895b2-01cb-456c-9871-8dca069caf1f");
        xhr.send(data);
    })
  };