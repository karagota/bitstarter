#!/usr/bin/env node
/*
Automaticallyy grade files for the presence of specidied HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:


 + cheerio
  - https://github.com/MatthewMueller/cheerio
  - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
  - http://maxogden.com/scraping-with-node.html


+ commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interdaces-made-easy

+ JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/
var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://obscure-fjord-6124.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var buildfn = function(checksfile) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            checkHtmlString(result.toString(), checksfile);
        }
    };
    return response2console;
};

var checkHtmlString = function(HtmlString, checksfile) {
	$ = cheerio.load(HtmlString);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	output(outJson);
};

var function output(out) {
	console.log(out);
}

var checkHtmlFile = function(htmlfile, checksfile) {
    var string  = fs.readFileSync(htmlfile);
    checkHtmlString(string, checksfile);
};

var checkUrl = function (url, checksfile) {
    var response2console = buildfn(checksfile);
	restler.get(url).on('complete', response2console);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url>', 'url')
        .parse(process.argv);
	if (program.url) checkUrl(program.url, program.checks);
	else if (program.file) checkHtmlFile(program.file, program.checks);
	
} else {
	exports.checkHtmlFile = checkHtmlFile;
	exports.checkUrl = checkUrl;
}


