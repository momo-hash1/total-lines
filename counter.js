const minimist = require("minimist");
const fs = require("fs");
const path = require("path");

const options = {
  allowedExt: ["js", "py", "c", "cpp"],
  excludedDirs: ["node_modules", "venv", "x64", "SDL2-2.0.18"],
  rootDir: ''
}

const checkIncludedItems = (items, predicate) => {
  let allowed = false;
  items.forEach((orig_name) => {
    if (predicate(orig_name)) {
      allowed = true;
    }
  });
  return allowed;
};

const isHiddenFolder = (_path) => checkIncludedItems(_path.split("\\"), (name) => name.match(/^\./));
const isExDir = (_path) => checkIncludedItems(options.excludedDirs, (name) => _path.includes(name))
const isAllowExt = (_path) => checkIncludedItems(options.allowedExt, (name) => name === path.parse(_path).ext.substring(1))

const searchSourceFiles = (_path, files) => {
  fs.readdirSync(_path).forEach((file) => {
    const absolute = path.join(_path, file);
    if (fs.statSync(absolute).isDirectory()) {
      if (!isExDir(absolute)) {
        return searchSourceFiles(absolute, files);
      }
    } else {
      if (!isHiddenFolder(absolute) && isAllowExt(absolute)) {
        files.push(absolute);
      }
    }
  });
};

const countLineInFile = (file_info) => {
  return file_info.map((file) => {
    lines = {blank: 0, code: 0};

    fs.readFileSync(file, "utf-8")
      .split("\n")
      .forEach((line) => {
        if (line === '') {
          lines.blank += 1
        }
        lines.code += 1;
      });

    return { dir: file, lines: lines }
  });
};

const parseArgList = (args) => {
  return args.includes(',') ? args.split(',') : [args]
}

const validateArgs = (args) => {
  if ("dir" in args) {
    if (path.isAbsolute(args.dir)) {
      options.rootDir = args.dir
      options.excludedDirs = parseArgList(args.e.replaceAll(' ', ''))
      options.allowedExt = parseArgList(args.a.replaceAll(' ', ''))
    } else {
      console.log("Path not absolute");
    }
  } else {
    console.log("Enter a directory");
  }
};

const counter = () => {
  validateArgs(minimist(process.argv.slice(2)));
  let files = []
  searchSourceFiles(options.rootDir, files);
  files = countLineInFile(files)
  console.log(files);
}

counter()