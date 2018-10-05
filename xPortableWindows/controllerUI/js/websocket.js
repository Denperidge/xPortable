var ws;
var url;  // Example: ws://190.160.0.100:7000

// Connect websocket, add handler for disconnected alert. This is for every connection
function CreateWebsocket(suffix) {
    var url = "ws://{ip}:7000";

    ws = new WebSocket(url + suffix);
    ws.addEventListener("message", function(event) {
        if (event.data.startsWith("Disconnect:")) { 
            ws.close(1000);
            DisconnectedAlert(event.data);
        }
    });
}

function ConnectToHost() {
    CreateWebsocket("/connect");

    ws.addEventListener("open", function (event) {
        ws.send("Connect");
    });

    // Connect, wait to get assigned a controller port
    ws.addEventListener("message", function (event) {
        // Either returns "Connected:xbox36O_portX" or "Disconnect: too many controllers"
        if (event.data.startsWith("Connected:")) {
            ws.close(1000);

            // Example: x360_port1
            var controllerPort = event.data.replace("Connected:", "");

            CreateWebsocket("/" + controllerPort);

            ws.addEventListener("close", function (event) {
                alert("Disconnected!");
            });
        }
    });
}
ConnectToHost();
