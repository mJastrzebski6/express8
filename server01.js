var path = require("path");
var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.static("static"));

var hbs = require("express-handlebars");
var formidable = require("formidable");

app.set("views", path.join(__dirname, "views"));
app.engine("hbs", hbs({ defaultLayout: "main.hbs" }));
app.set("view engine", "hbs");
app.use(
  express.urlencoded({
    extended: true,
  })
);
let fileExtensions = [
  "doc",
  "docx",
  "exe",
  "htm",
  "jpg",
  "pdf",
  "php",
  "png",
  "rar",
  "txt",
  "xls",
  "zip",
];
//app.use(express.json());

let serverFiles = [];
let lastFileId = 1;

app.get("/", function (req, res) {
  let context = {
    sidebarTitle: "multiupload",
  };
  res.render("index.hbs", context);
});

app.post("/", function (req, res) {
  let form = formidable({});
  form.multiples = true;
  form.keepExtensions = true;
  form.uploadDir = __dirname + "/static/upload/";
  form.parse(req, function (err, fields, files) {
    if (Object.keys(files["lol"])[0] == "0") {
      for (const [key, value] of Object.entries(files["lol"])) {
        value.savedate = Date.now();
        value.id = lastFileId;
        lastFileId++;
        serverFiles.push(value);
        if (fileExtensions.includes(getExtension(value.name)))
          value.photo = getExtension(value.name);
        else value.photo = "uknown";
        //console.log(value);
      }
    } else {
      files["lol"].id = lastFileId;
      files["lol"].savedate = Date.now();
      lastFileId++;
      serverFiles.push(files["lol"]);
      if (fileExtensions.includes(getExtension(files["lol"].name)))
        files["lol"].photo = getExtension(files["lol"].name);
      else files["lol"].photo = "uknown";
    }
  });
  res.render("index.hbs");
});

function getExtension(filename) {
  var ext = path.extname(filename || "").split(".");
  return ext[ext.length - 1].toLocaleLowerCase();
}

app.get("/filemanager", function (req, res) {
  let context = {
    sidebarTitle: "filemanager",
    files: serverFiles,
  };

  res.render("filemanager.hbs", context);
});

app.post("/download", function (req, res) {
  let wantedFile = serverFiles.filter((x) => x.id == req.body.downloadId);
  res.download(wantedFile[0]["path"]);
  //res.redirect("/filemanager");
});

app.get("/info/", function (req, res) {
  res.render("info.hbs");
});

app.post("/deleteOne", function (req, res) {
  serverFiles = serverFiles.filter((x) => x.id != req.body.deleteId);
  res.redirect("/filemanager");
});

app.get("/reset", function (req, res) {
  serverFiles = [];
  res.redirect("/filemanager");
});

app.get("/info/:id", function (req, res) {
  let selectedFile = serverFiles.filter((x) => x.id == req.params.id);
  console.log(selectedFile[0]);
  let context = {
    sidebarTitle: "fileInfo",
    file: selectedFile[0],
  };

  res.render("info.hbs", context);
});

// nasłuch na określonym porcie
app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
