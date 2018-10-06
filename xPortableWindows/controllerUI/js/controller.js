// Assign functions to every button

function SetupUserInterface() {
    // Translation table: which code reffers to which control
    var table =
    {
        "Left_Thumb": "0",
        "Right-Thumb": "1",

        "A": "2",
        "X": "3",
        "B": "4",
        "Y": "5",

        "LT": "6",
        "RT": "7",
        "LB": "8",
        "RB": "9",

        "D_Pad_Left": "10",
        "D_Pad_Up": "11",
        "D_Pad_Right": "12",
        "D_Pad_Down": "13",

        "Left_Thumb_Press": "14",
        "Right_Thumb_Press": "15",

        "Start": "16",
        "Guide": "17"
    };

    var buttonIDs = Object.keys(table);

    // 0-3 are joysticks
    var leftThumbContainer = document.getElementById("leftThumbContainer");
    
    leftThumbContainer.addEventListener("mousedown", startMoveLeftJoystick);
    leftThumbContainer.addEventListener("touchstart", startMoveLeftJoystick);

    leftThumbContainer.addEventListener("mousemove", moveLeftJoystick);
    leftThumbContainer.addEventListener("touchmove", moveLeftJoystick);
    
    document.addEventListener("mouseup", stopMoveLeftJoystick);
    document.addEventListener("touchend", stopMoveLeftJoystick);

    var rightThumb = document.getElementById("rightThumb");


    // value is 1 if pressed, 0 if no longer pressed
    var Send = function (buttonID, value) {
        return function send(e) {
            ws.send(buttonID + "/" + value);
        }
    }
    // Start at 2  (joysticks already handled)
    for (var i = 2; i < buttonIDs.length; i++) {
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

function stopMoveLeftJoystick(e) {
    ws.send("0/0;0");
    leftThumbDown = false;

    leftThumb.style.left = "50%";
    leftThumb.style.top = "50%";
}
