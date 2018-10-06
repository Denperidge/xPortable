const express = require("express");
const app = express();

var root = "controllerUI";

app.get("/", (req, res) => res.sendFile("index.html", { root: root }));
app.get("/css/*", (req, res) => res.sendFile(req.url, { root: root }))
app.get("/js/*", (req, res) => res.sendFile(req.url, { root: root }))
app.get("/svg/*", (req, res) => res.sendFile(req.url, { root: root }))

app.listen(7001, () => { });
