window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
        chrome.tabs.create({url:'https://app.gitkraken.com/oauth/authorize?response_type=code&client_id=aajdmgmjv5myynpbkgcg&scope=board:write&state=qwert12345'});
    });    
  };