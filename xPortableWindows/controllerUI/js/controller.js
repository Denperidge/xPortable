// Assign functions to every button

var leftThumbContainer = document.getElementById("leftThumbContainer");
var rightThumbContainer = document.getElementById("rightThumbContainer");
var leftThumb = document.getElementById("leftThumb");
var rightThumb = document.getElementById("rightThumb");


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

    // 0-1 are joysticks

    leftThumbContainer.addEventListener("mousedown", startMoveLeftJoystick);
    leftThumbContainer.addEventListener("touchstart", startMoveLeftJoystick);

    leftThumbContainer.addEventListener("mousemove", moveLeftJoystick);
    leftThumbContainer.addEventListener("touchmove", moveLeftJoystick);

    rightThumbContainer.addEventListener("mousedown", startMoveRightJoystick);
    rightThumbContainer.addEventListener("touchstart", startMoveRightJoystick);

    rightThumbContainer.addEventListener("mousemove", moveRightJoystick);
    rightThumbContainer.addEventListener("touchmove", moveRightJoystick);

    document.addEventListener("mouseup", stopMoveJoystick);
    document.addEventListener("touchend", stopMoveJoystick);

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
var rightThumbDown = false;
var thumbMin;
var thumbMax;
var thumbMiddle;
var leftMaxLeftOffset;
var leftMaxTopOffset;
var rightMaxLeftOffset;
var rightMaxTopOffset;
var screenMiddle;

// Calculate the middle and max values of the joysticks
function CalculateThumbVariables() {
    thumbMin = parseInt(getComputedStyle(document.getElementById("leftThumbMax")).marginLeft.replace("px", ""));
    //thumbMax = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).width.replace("px", ""));
    thumbMax = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).width.replace("px", "")) - thumbMin;
    //thumbMax = parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).width.replace("px", ""));
    thumbMiddle = thumbMax / 2;

    leftMaxLeftOffset =
        parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).left.replace("px", "")) +
        parseInt(getComputedStyle(document.getElementById("leftThumbMax")).marginLeft.replace("px", ""));
    leftMaxTopOffset =
        parseInt(getComputedStyle(document.getElementById("leftThumbContainer")).top.replace("px", "")) +
        parseInt(getComputedStyle(document.getElementById("leftThumbMax")).marginTop.replace("px", ""));


    rightMaxLeftOffset =
        parseInt(getComputedStyle(document.getElementById("rightThumbContainer")).left.replace("px", "")) +
        parseInt(getComputedStyle(document.getElementById("rightThumbMax")).marginRight.replace("px", ""));
    rightMaxTopOffset =
        parseInt(getComputedStyle(document.getElementById("rightThumbContainer")).top.replace("px", "")) +
        parseInt(getComputedStyle(document.getElementById("rightThumbMax")).marginTop.replace("px", ""));

    screenMiddle = window.innerWidth / 2;
}
window.addEventListener("resize", CalculateThumbVariables);
CalculateThumbVariables();  // Run once at startup


// Calculate how far the joystick is from the center to the box in percentage
function CalculateThumbValue(thumb, mouseValue, styleName) {
    var mouseOverMin = mouseValue < thumbMin;
    var mouseOverMax = mouseValue > thumbMax;

    // On the X-axis, left is -100% and right is 100%
    // On the Y-axis, top should be 100% and bottom -100%
    // however, because CSS has to use left/top for positioning things like this,
    // top is -100% and bottom is 100%. This is good for style.top, but when
    // styleName == top, invert the value

    if (!mouseOverMin && !mouseOverMax) {
        thumb.style[styleName] = mouseValue + "px";
        var joystickValue = parseInt((mouseValue - thumbMiddle) / thumbMiddle * 100).toString();
        return joystickValue * ((styleName == "top") ? -1 : 1);
    }
    // Don't move the joystick if mouse is outside of the box, just apply min/max value
    else if (mouseOverMin) {
        thumb.style[styleName] = thumbMin + "px";
        return (styleName == "top") ? "100" : "-100";  // %
        // TODO vibrate
    } else if (mouseOverMax) {
        thumb.style[styleName] = thumbMax + "px";
        return (styleName == "top") ? "-100" : "100";  // %
        // TODO vibrate
    }
}

function startMoveLeftJoystick(e) {
    leftThumbDown = true;
    // Adding thumbMin corrects it to the middle of the cursor
    leftThumb.style.left = e.clientX - leftMaxLeftOffset + thumbMin + "px";
    leftThumb.style.top = e.clientY - leftMaxTopOffset + thumbMin + "px";
    
    var mouseX = (e.clientX - leftMaxLeftOffset + thumbMin) || (e.targetTouches[0].clientX - leftMaxLeftOffset + thumbMin);
    var mouseY = (e.clientY - leftMaxTopOffset + thumbMin) || (e.targetTouches[0].clientY - leftMaxTopOffset + thumbMin);
    ws.send(
        "0/"
        + CalculateThumbValue(leftThumb, mouseX, "left")
        + ";"
        + CalculateThumbValue(leftThumb, mouseY, "top")
    );
}


function moveLeftJoystick(e) {
    e.preventDefault();
    if (leftThumbDown) {
        var mouseX = (e.clientX - leftMaxLeftOffset + thumbMin) || (e.targetTouches[0].clientX - leftMaxLeftOffset + thumbMin);
        var mouseY = (e.clientY - leftMaxTopOffset + thumbMin) || (e.targetTouches[0].clientY - leftMaxTopOffset + thumbMin);
        ws.send(
            "0/"
            + CalculateThumbValue(leftThumb, mouseX, "left")
            + ";"
            + CalculateThumbValue(leftThumb, mouseY, "top")
        );
    }
}


function startMoveRightJoystick(e) {
    rightThumbDown = true;
    rightThumb.style.left = e.clientX - rightMaxLeftOffset + thumbMin + "px";
    rightThumb.style.top = e.clientY - rightMaxTopOffset + thumbMin + "px";
    
    var mouseX = (e.clientX - rightMaxLeftOffset + thumbMin) || (e.targetTouches[0].clientX - rightMaxLeftOffset + thumbMin);
    var mouseY = (e.clientY - rightMaxTopOffset + thumbMin) || (e.targetTouches[0].clientY - rightMaxTopOffset + thumbMin);
    ws.send(
        "1/"
        + CalculateThumbValue(rightThumb, mouseX, "left")
        + ";"
        + CalculateThumbValue(rightThumb, mouseY, "top")
    );
}


function moveRightJoystick(e) {
    e.preventDefault();
    if (rightThumbDown) {
        var mouseX = (e.clientX - rightMaxLeftOffset + thumbMin) || (e.targetTouches[0].clientX - rightMaxLeftOffset + thumbMin);
        var mouseY = (e.clientY - rightMaxTopOffset + thumbMin) || (e.targetTouches[0].clientY - rightMaxTopOffset + thumbMin);

        ws.send(
            "1/"
            + CalculateThumbValue(rightThumb, mouseX, "left")
            + ";"
            + CalculateThumbValue(rightThumb, mouseY, "top")
        );
    }
}

function stopMoveJoystick(e) {
    if (leftThumbDown && e.clientX <= screenMiddle) {
        ws.send("0/0;0");
        leftThumbDown = false;

        leftThumb.style.left = "50%";
        leftThumb.style.top = "50%";
    }
    else if (rightThumbDown && e.clientX > screenMiddle) {
        ws.send("1/0;0");
        rightThumbDown = false;

        rightThumb.style.left = "50%";
        rightThumb.style.top = "50%";
    }
}
