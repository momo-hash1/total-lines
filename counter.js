const minimist = require('minimist')
const fs = require('fs')
const path = require('path')



const validateArgs = (args) => {
    if ('dir' in args) {
        if (path.isAbsolute(args.dir)) {
            
        }else{
            console.log('Path not absolute')
        }
    }else{
        console.log('Enter a directory')
    }
}

validateArgs(minimist(process.argv.slice(2)))