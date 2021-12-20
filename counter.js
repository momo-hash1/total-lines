const minimist = require('minimist')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const allowedExt = ['js', 'py', 'c', 'cpp']

const searchSourceFiles = (_path) => {

    allowedExt.forEach(ext => {
        glob(`${_path}/**/!(node_modules|venv)/*.${ext}`, (er, files) => {
            files.forEach(el => {
                if (!el.match('venv') && !el.match('node_modules')) {
                    console.log(path.parse(el));
                }
            })
        })
    })
}

const validateArgs = (args) => {
    if ('dir' in args) {
        if (path.isAbsolute(args.dir)) {
            searchSourceFiles(args.dir)
        }else{
            console.log('Path not absolute')
        }
    }else{
        console.log('Enter a directory')
    }
}

validateArgs(minimist(process.argv.slice(2)))