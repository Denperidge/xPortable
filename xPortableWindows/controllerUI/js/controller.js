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

    // 0-3 are joysticks

    var le = document.getElementById("leftThumbContainer");
    
    le.addEventListener("mousedown", startMoveLeftJoystick);
    le.addEventListener("touchstart", startMoveLeftJoystick);

    le.addEventListener("mousemove", moveLeftJoystick, true);
    le.addEventListener("touchmove", moveLeftJoystick, true);
    
    document.addEventListener("mouseup", stopMoveLeftJoystick);
    //le.addEventListener("mouseout", stopMoveLeftJoystick);
    document.addEventListener("touchend", stopMoveLeftJoystick);
    //le.addEventListener("touchcancel", stopMoveLeftJoystick);

    var rightThumb = document.getElementById("rightThumb");
     // TODO use translate


    // Start at 4  (joysticks already handled)
    for (var i = 4; i < buttonIDs.length; i++) {
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

var leftThumbStartX;
var leftThumbStartY;
var leftThumbOriginalLocation;
var leftThumbDown = false;
var leftThumbMiddle;
//var leftThumbSendInterval;

var rightThumbStartX;
var rightThumbStartY;
var rightThumbOriginalLocation;

var leftThumb = document.getElementById("leftThumb");


var leftThumbOffsetX;
var leftContainerOffset;
var leftThumbMax;

function startMoveLeftJoystick(e) {
    leftThumbDown = true;
    leftThumbOffsetX = leftThumb.offsetLeft - e.clientX;
    //leftThumb.style.left = e.layerX + "px";
    leftContainerOffset = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).left.replace("px", ""));
    leftThumbMax = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).width.replace("px", ""));
    leftThumbMiddle = leftThumbMax / 2;

    //setInterval(moveLeftJoystick, 350);
    
    /*
    leftThumb.addEventListener("mousemove", moveLeftJoystick);
    leftThumb.addEventListener("touchmove", moveLeftJoystick);
    */
    
    //joystick.left =
    /*
    leftThumbOriginalLocation = window.getComputedStyle(e.srcElement).transform;
    leftThumbStartX = e.screenX;
    leftThumbStartY = e.screenY;

    leftThumb.addEventListener("mousemove", moveLeftJoystick);
    leftThumb.addEventListener("touchmove", moveLeftJoystick);
    */
}

function moveLeftJoystick(e) {
    e.preventDefault();
    if (leftThumbDown)
    {
        var mousePosition = e.screenX - leftContainerOffset;

        var mouseOverLeft = mousePosition < 0;
        var mouseOverRight = mousePosition > leftThumbMax;

        //clearInterval(leftThumbSendInterval);

        /*
        var Send = function (mouse) {
            return function send(e) {
                //ws.send(buttonID + "/" + value);
                console.log("Send: " + mouse);
            }
        }
        */

        
        if (!mouseOverLeft && !mouseOverRight) {
            console.log("Send: " + mousePosition);
            leftThumb.style.left = mousePosition + "px";
            //leftThumbSendInterval = setInterval(Send(mousePosition), 350);
            
        } else if (mouseOverLeft){

            console.log(0);
            //leftThumbSendInterval = setInterval(Send(0), 350);
        } else if (mouseOverRight) {
            console.log(150);
            //leftThumbSendInterval = setInterval(Send(150), 350);
        }//else stopMoveLeftJoystick();
        //console.log(e.screenX - leftContainerOffset);
        
        //leftThumb.style.left = (e.clientX + leftThumbOffsetX) + "px";
        //leftThumb.style.left = e.layerX;
    }
    
    //leftThumb.style.top = e.offsetY + "px";
    /*
    var joystick = e.srcElement;
    console.log(e.screenX);
    console.log(leftThumbStartX);
    var transformValues = window.getComputedStyle(joystick).transform.split(", ");
    transformValues[4] = (parseFloat(transformValues[4]) + e.screenX - leftThumbStartX) + "";
    transformValues[5] = (parseFloat(transformValues[5]) + e.screenY - leftThumbStartY) + "";
    console.log(transformValues.join(", ") + ")")
    joystick.style.transform = transformValues.join(", ") + ")";
    */
}

function NoLongerMoveJoystick(e){
    stopMoveLeftJoystick();
}
//leftThumb.addEventListener("mouseout", NoLongerMoveJoystick);

function stopMoveLeftJoystick(e) {

    leftThumbDown = false;
    console.log("stop");
    
    //clearInterval(leftThumbSendInterval);

    leftThumb.style.left = "50%";

    /*
    leftThumb.removeEventListener("mousemove", moveLeftJoystick, true);
    leftThumb.removeEventListener("touchmove", moveLeftJoystick, true);
    */
    /*
    var leftThumb = e.srcElement;

    var joystick = leftThumb.style.transform = leftThumbOriginalLocation;
    */
}