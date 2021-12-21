const minimist = require("minimist");
const fs = require("fs");
const path = require("path");

const allowedExt = ["js", "py", "c", "cpp"];
const excludedDirs = ["node_modules", "venv", 'x64', 'SDL2-2.0.18'];

const checkIncludedItems = (name, items) => {
  let allowed = false
  items.forEach((orig_name) => {
    if (name.includes(orig_name)) {
      allowed =  true;
    }
  });
  return allowed;
};

const isHiddenFolder = (_path) => {
  let hidden = false;
  _path.split("\\").forEach((item) => {
    if (item.match(/^\./)) {
      hidden = true;
    }
  });
  return hidden;
};

const countLineInFile = async (file) => {
  files = [];
  const searchSourceFiles = (_path) => {
    fs.readdirSync(_path).forEach((file) => {
      const absolute = path.join(_path, file);
      if (fs.statSync(absolute).isDirectory() ) {
        if (!checkIncludedItems(absolute, excludedDirs)) {
          
          return searchSourceFiles(absolute);
        }
      } else {
        if (!isHiddenFolder(absolute)) {
          files.push(absolute);
        }
      }
    });
  };

  searchSourceFiles(file);

  files.forEach((file) => {
    lines = 0;

    console.log(file);

    fs.readFileSync(file, "utf-8")
      .split("\n")
      .forEach((line) => {
        lines += 1;
      });
    console.log(lines);
  });
};

const validateArgs = (args) => {
  if ("dir" in args) {
    if (path.isAbsolute(args.dir)) {
      countLineInFile(args.dir);
    } else {
      console.log("Path not absolute");
    }
  } else {
    console.log("Enter a directory");
  }
};

validateArgs(minimist(process.argv.slice(2)));
