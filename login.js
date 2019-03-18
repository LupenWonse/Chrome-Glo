window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
        chrome.runtime.sendMessage({"type":"startLogin"});
    });    
  };