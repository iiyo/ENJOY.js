/* global require, console */

var fs, scriptsFilePath;
var minify = require("minify");

fs = require('fs');
scriptsFilePath = 'scripts.json';

function mkdirSync (path) {
    
    try {
        fs.mkdirSync(path);
    }
    catch (e) {
        if (e.code != 'EEXIST') {
            throw e;
        }
    }
};

function processScriptsFileFn (data) {
    
    var json;
    
    try {
        json = JSON.parse(data);
    }
    catch (e) {
        
        console.log('Parsing file ' + scriptsFilePath + ' as JSON failed!');
        console.log('Error was:' + e);
        
        return;
    }
    
    concatJsFiles(json.files);
};

function concatJsFiles (files) {
    
    var concatFile, moduleName, moduleString;
    
    moduleString = '';
    concatFile = ''; 
    
    function fn (path) {
        
        function concFn (data) {
            concatFile += "\n\n" + removeUnwantedSections(data);
        };
        
        concFn(fs.readFileSync('./' + path, 'utf-8'));
    };
    
    moduleString += "\n\nvar $__ShinyScripts = document.getElementsByTagName('script');";
    moduleString += "\nvar $__ShinyPath = $__ShinyScripts[$__ShinyScripts.length - 1].src;\n";
    
    for (moduleName in files) {
        moduleString += "\nusing.modules['" + moduleName + "'] = $__ShinyPath;";
    }
    
    concatFile += moduleString;
    
    for (moduleName in files) {
        fn(files[moduleName]);
    }
    
    writeFileFn(concatFile);
};

function writeFileFn (concatFile) {
    
    function makeErrorFn (successText) {
        return function (err) {
            
            if (err) {
                console.log(err);
                return;
            }
            
            console.log(successText);
        };
    }
    
    mkdirSync('./bin');
    fs.writeFile('./bin/shiny.js', concatFile, makeErrorFn('File created.'));
    
    minify({ext: '.js', data: concatFile}, function(error, data) {
        if (error) {
            console.log(error);
        }
        else {
            fs.writeFile('./bin/shiny.min.js', data, 
                makeErrorFn("Minified file created."));
        }
    });
}

function removeUnwantedSections (fileContents) {
    
    fileContents = fileContents.
        replace(/\/\*<ON_DEPLOY_REMOVE>\*\/[\s\S]*\/\*<\/ON_DEPLOY_REMOVE>\*\//g, "");
    
    return fileContents;
}

processScriptsFileFn(fs.readFileSync(scriptsFilePath, 'utf-8'));
