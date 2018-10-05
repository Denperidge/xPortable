// pressed is 1 if pressed, 0 if no longer pressed

function SetupUserInterface() {

    // Translation table: which code reffers to which control
    var table =
    {
        "Left_ThumbX": "0",
        "Left_ThumbY": "1",
        "Right-ThumbX": "2",
        "Right-ThumbY": "3",

        "A": "4",
        "X": "5",
        "B": "6",
        "Y": "7",

        "LT": "8",
        "RT": "9",
        "LB": "10",
        "RB": "11",

        "D_Pad_Left": "12",
        "D_Pad_Up": "13",
        "D_Pad_Right": "14",
        "D_Pad_Down": "15",

        "Left_Thumb_Press": "16",
        "Right_Thumb_Press": "17",

        "Guide": "18",
        "Start": "19"
    };

    var buttonIDs = Object.keys(table);

    var Send = function (buttonID, value) {
        return function send(e) {
            ws.send(buttonID + "/" + value);
        }
    }

    for (var i = 0; i < buttonIDs.length; i++) {
        var button = document.getElementById(buttonIDs[i]);
        if (button == undefined) continue;
        var id = table[buttonIDs[i]];

        button.addEventListener("mousedown", Send(id, "1"));
        button.addEventListener("mouseup", Send(id, "0"));
        button.addEventListener("mouseout", Send(id, "0"));

        button.addEventListener("touchstart", Send(id, "1"));
        button.addEventListener("touchend", Send(id, "0"));
        button.addEventListener("touchcancel", Send(id, "0"));

    }
}
SetupUserInterface();
