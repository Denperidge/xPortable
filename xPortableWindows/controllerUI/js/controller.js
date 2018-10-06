// pressed is 1 if pressed, 0 if no longer pressed

function SetupUserInterface() {

    // Translation table: which code reffers to which control
    var table =
    {
        "Left_Thumb": "0",
        "Right-Thumb": "1",

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
    var leftThumbContainer = document.getElementById("leftThumbContainer");
    
    leftThumbContainer.addEventListener("mousedown", startMoveLeftJoystick);
    leftThumbContainer.addEventListener("touchstart", startMoveLeftJoystick);

    leftThumbContainer.addEventListener("mousemove", moveLeftJoystick);
    leftThumbContainer.addEventListener("touchmove", moveLeftJoystick);
    
    document.addEventListener("mouseup", stopMoveLeftJoystick);
    document.addEventListener("touchend", stopMoveLeftJoystick);

    var rightThumb = document.getElementById("rightThumb");


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


// JOYSTICK CODE
// For reasons of optimization, it is assumed that:
// Both joytstick containers have the same width/height
// And that the width and height of these containers are equal




var leftThumbDown = false;
var leftThumb = document.getElementById("leftThumb");
var thumbMax;
var thumbMiddle;
var leftContainerLeftOffset;
var leftContainerTopOffset;

// Calculate the middle and max values of the joysticks
function CalculateThumbVariables() {
    thumbMax = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).width.replace("px", ""));
    thumbMiddle = thumbMax / 2;

    leftContainerLeftOffset = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).left.replace("px", ""));
    leftContainerTopOffset = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).top.replace("px", ""));
}
window.addEventListener("resize", CalculateThumbVariables);
CalculateThumbVariables();  // Run once at startup

function startMoveLeftJoystick(e) {
    leftThumbDown = true;
    leftThumb.style.left = e.clientX - leftContainerLeftOffset + "px";
    leftThumb.style.top = e.clientY - leftContainerTopOffset + "px";
}

function moveLeftJoystick(e) {
    console.log(e);
    e.preventDefault();
    if (leftThumbDown)
    {
        var value = "0/";

        // Calculate how far the joystick is from the center to the box in percentage
        function CalculatePercentage (mouseValue, styleName){
            var mouseOverMin = mouseValue < 0;
            var mouseOverMax = mouseValue > thumbMax;

            // On the X-axis, left is -100% and right is 100%
            // On the Y-axis, top should be 100% and bottom -100%
            // however, because CSS has to use left/top for positioning things like this,
            // recalculations have to be made if styleName == top

            if (!mouseOverMin && !mouseOverMax) {
                leftThumb.style[styleName] = mouseValue + "px";
                var joystickValue = parseInt((mouseValue - thumbMiddle) / thumbMiddle * 100).toString();
                console.log(joystickValue);
                value += joystickValue * ((styleName == "top") ? -1 : 1);
            } 
            // Don't move the joystick if mouse is outside of the box, just apply min/max value
            else if (mouseOverMin) {
                leftThumb.style[styleName] = "0px";
                value += (styleName == "top") ? "100" : "-100";  // %
                // TODO vibrate
            } else if (mouseOverMax) {
                leftThumb.style[styleName] = thumbMax + "px";
                value += (styleName == "top") ? "-100" : "100";  // %
                // TODO vibrate
            }
        }

        console.log(e);
        var mouseX = (e.clientX - leftContainerLeftOffset) || (e.targetTouches[0].clientX - leftContainerLeftOffset);
        var mouseY = e.clientY - leftContainerTopOffset || (e.targetTouches[0].clientY - leftContainerTopOffset);

        CalculatePercentage(mouseX, "left");
        value += ";"
        CalculatePercentage(mouseY, "top");

        ws.send(value);
    }
}

function NoLongerMoveJoystick(e){
    stopMoveLeftJoystick();
}

function stopMoveLeftJoystick(e) {
    leftThumbDown = false;

    leftThumb.style.left = "50%";
    leftThumb.style.top = "50%";
}