const minimist = require("minimist");
const fs = require("fs");
const path = require("path");

const options = {
  allowedExt: [],
  excludedDirs: [],
  rootDir: '',
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

const parseFiles = (file_info) => {
  return file_info.map((file) => {
    lines = 0;
    fs.readFileSync(file, "utf-8")
      .split("\n")
      .forEach((line) => {
        if (line !== '') {
          lines += 1;
        }
      });

    return { dir: file, lines: lines, date: fs.statSync(file).mtime.toLocaleDateString() }
  });
};

const parseArgList = (args) => {
  return args.includes(',') ? args.split(',') : [args]
}

const countTotalLineByExt = (files) => {
  totalLineByExt = {}
  files.forEach(file => {
    const ext = path.parse(file.dir).ext
    if (ext in totalLineByExt) {
      totalLineByExt[ext] += file.lines
    } else {
      totalLineByExt[ext] = file.lines
    }
  })
  return totalLineByExt
}

const formatDict = (dict) => {
  let string = ''
  Object.keys(dict).forEach(item => {
    string += '{'
    string += `${item} ${dict[item]}`
    string += '}'

  })
  return string
}

const saveReport = (files) => {
  totalLineByExt = countTotalLineByExt(files)
  let report = fs.createWriteStream('report.txt', { flags: 'a' })
  files.forEach(file => {
    Object.keys(file).forEach(key => {
      report.write(`${key}:${file[key]}\n`)
    })
    report.write('\n')
  })
  report.write(`total lines by extension: ${formatDict(totalLineByExt)}\n`)
  report.write(`total lines: ${Object.values(totalLineByExt).reduce((x, y) => x + y)}`)
  report.end()
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
  files = parseFiles(files)

  saveReport(files)
}

counter()