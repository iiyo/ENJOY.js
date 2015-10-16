/* global require, console */

var fs, scriptsFilePath, template;
var minify = require("minify");
var exec = require("child_process").exec;

fs = require('fs');
scriptsFilePath = 'scripts.json';
template = "" + fs.readFileSync('deploy-template.tpl');

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
    
    var coreFile, moduleName, fullFile;
    
    coreFile = ''; 
    
    function fn (path) {
        
        function concFn (data) {
            coreFile += "" + removeUnwantedSections(data);
        };
        
        concFn(fs.readFileSync('./' + path, 'utf-8'));
    };
    
    for (moduleName in files) {
        fn(files[moduleName]);
    }
    
    coreFile = template.replace("{{content}}", coreFile);
    fullFile = fs.readFileSync("./libs/using.js/using.js", "utf-8") + coreFile;
    
    writeFileFn(coreFile, "enjoy-core");
    writeFileFn(fullFile, "enjoy");
    
    exec("docco -o docs/ bin/enjoy-core.js", function () {
        exec("mv docs/enjoy-core.html docs/index.html", function () {
            console.log("Documentation created.");
        });
    });
};

function writeFileFn (contents, fileNameBase) {
    
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
    fs.writeFile('./bin/' + fileNameBase + '.js', contents, makeErrorFn('File created.'));
    
    minify({ext: '.js', data: contents}, function(error, data) {
        if (error) {
            console.log(error);
        }
        else {
            fs.writeFile('./bin/' + fileNameBase + '.min.js', data, 
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
