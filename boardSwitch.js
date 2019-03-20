window.onload = function() {
    var boardSwitcher = document.getElementById("boardSwitcher");
    chrome.storage.local.get("boards",function(data){
        var boards = data.boards;
        if (boards.length > 0 ){
            boardSwitcher.removeChild(boardSwitcher.getElementsByTagName('option')[0]);
            var board = undefined;
            for (let board of boards){
                var option = document.createElement("option");
                option.innerHTML = board.name;
                boardSwitcher.appendChild(option);
            }
        }
    });
};