var boardSwitcher = undefined;
var boards = undefined;

window.onload = function() {
    boardSwitcher = document.getElementById("boardSwitcher");
    chrome.storage.local.get("boards",function(data){
        boards = data.boards;
        // We have boards
        if (boards.length > 0 ){
            boardSwitcher.removeChild(boardSwitcher.getElementsByTagName('option')[0]);
            var board = undefined;
            for (let board of boards){
                var option = document.createElement("option");
                option.innerHTML = board.name;
                option.setAttribute("value",board.id);
                boardSwitcher.appendChild(option);
            }
        } else {
            
        }
        // We do not have boards
        updateBoard();
    });
    
    boardSwitcher.addEventListener("change",function(event){
        chrome.storage.local.set({"boardIndex" : event.target.selectedIndex},function(){
            updateBoard();
        })
    })
    
    document.querySelector('button').addEventListener('click', function() {
        chrome.runtime.sendMessage({"type":"logout"});
        window.location.href = "/login.html";
    }); 
};

function updateBoard(){
    chrome.storage.local.get("boardIndex", function(result){
        if (result.boardIndex > 0) {
            boardSwitcher.selectedIndex = result.boardIndex;
            chrome.runtime.sendMessage({"type":"selectBoard","index":result.boardIndex});
        } else {
            boardSwitcher.selectedIndex = 0;
            chrome.runtime.sendMessage({"type":"selectBoard","index":0});
        }
        //        document.getElementById("mainText").innerHTML = boards[boardSwitcher.selectedIndex].name;
    });
}

window.onunload = function() {
    console.log("ONUNLOAD");
}