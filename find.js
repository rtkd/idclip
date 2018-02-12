(function()
{
	"use strict";

	var fs = require('fs');
	var path = require('path');
	var readline = require('readline');
	var stream = require('stream');
	var jsdom = require('jsdom');

	var config =
	{
		'buildHTML': true,
		'removeScripts': true,
		'replaceImages': true,
		'hostsPerHTMLFile': 5,
		'logInterval': 60000,

		'happyKitten': 'http://placehold.it/200x100&text=Image replaced',
		'logFile': 'log/.log',
		'htmlHeader': '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;}nav a{display:inline-block;padding:1rem;}.item{display:inline-block;}.itemURL{margin-bottom:1rem;}</style></head><body>',
		'htmlFooter': '</body></html>'
	};

	var log = function(string, isError) { console.log(string); if (isError) process.exit(); };

	if (!process.argv[2]) log('Argument 1 missing. Expecting Regular Expression.', true);
	if (!process.argv[3]) log('Argument 2 missing. Expecting source file.', true);
	if (!process.argv[4]) log('Argument 3 missing. Expecting destination file.', true);

	var logCounter = 0;
	var logProgress = function() { logCounter ++; log('Done: ' + current + ' / Hosts: ' + matches +' / Avg: ' + Math.floor(current / logCounter)); };
	var logStatus = setInterval(logProgress, config.logInterval);

	var getTime = function(date)
	{
		var h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
		return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
	};

	var splitHostsToFiles = function ()
	{
		var files = [];
		for (var i = 0, ii = 0, iii = hosts.length; i < iii; i += config.hostsPerHTMLFile) { files[ii] = hosts.slice(i, i + config.hostsPerHTMLFile); ii ++; }
		return files;
	};

	var buildMenu = function (pageCount)
	{
		var menu = '<nav>';
		for (var i = 0; i < pageCount; i ++) { menu += '<a href="' + outFileName + '-' + i + '.html' + '">' + i + '</a>'; }
		return menu += '</nav>';
	};

	var removeScripts = function (dom) { dom.window.document.querySelectorAll('script').forEach(function(script){ script.remove(); }); };

	var replaceImages = function (dom) { dom.window.document.querySelectorAll('img').forEach(function(image){ image.src = config.happyKitten; }); };

	var isDir = function (path)
	{
		try	{ return fs.statSync(path).isDirectory(); }
		catch (e) { if (e.code === 'ENOENT') return false; else throw e; }
	};

	var isFile = function (path)
	{
		try	{ return fs.statSync(path).isFile(); }
		catch (e) { if (e.code === 'ENOENT') return false; else throw e; }
	};

	var regex = new RegExp(process.argv[2], 'i');

	var inDirName = path.dirname(process.argv[3]);
	var inFileName = path.basename(process.argv[3], path.extname(process.argv[3]));

	var outDirName = path.dirname(process.argv[4]);
	var outFile = path.basename(process.argv[4]);
	var outFileName = path.basename(process.argv[4], path.extname(process.argv[4]));

	var inStream = fs.createReadStream(process.argv[3]);
	var readLine = readline.createInterface(inStream);

	var current = 0, matches = 0, hosts = [];

	readLine.on('line', function(line)
	{
		var host = JSON.parse(line);
		var hostDataDecoded = new Buffer(host.data, 'base64').toString('utf8');

		if (regex.test(hostDataDecoded))
		{
			var item = { 'vhost': host.vhost, 'host': host.host, 'data': hostDataDecoded, 'port': host.port, 'ip': host.ip };
			hosts.push(item);
			matches ++;
		}

		current ++;
	});

	readLine.on('close', function()
	{
		clearInterval(logStatus);

		var  json = [];

		hosts.forEach(function(host) { json.push(JSON.stringify(host)); });

		if (!isDir(path.join(outDirName, inFileName))) fs.mkdirSync(path.join(outDirName, inFileName));
		if (!isDir(path.join(outDirName, inFileName, outFileName))) fs.mkdirSync(path.join(outDirName, inFileName, outFileName));

		if (!isFile(path.join(outDirName, inFileName, outFileName, outFile))) fs.writeFile(path.join(outDirName, inFileName, outFileName, outFile), json.join('\n'));
		else
		{
			log('File exists. Renaming..');
			fs.writeFile(path.join(outDirName, inFileName, outFileName, outFile) + '-' + getTime(new Date()), json.join('\n'));
		}

		fs.appendFile(config.logFile, process.argv[2] + ' // ' + process.argv[3] + ' // ' + path.join(outDirName, inFileName, outFileName, outFile) + ' // ' + matches + ' Hosts\n');

		if (config.buildHTML === true)
		{
			var htmlFiles = [];

			var hostsPerHTMLFile = splitHostsToFiles();

			var htmlMenu = buildMenu(hostsPerHTMLFile.length);

			hostsPerHTMLFile.forEach(function(file, i)
			{
				htmlFiles[i] = [];

				htmlFiles[i].push(config.htmlHeader);
				htmlFiles[i].push(htmlMenu);

				file.forEach(function(host)
				{
					var hostDataHTML = host.data.match(/<html([\s\S]*?)html>/ig);
					hostDataHTML = hostDataHTML ? hostDataHTML.toString() : undefined;

					if (hostDataHTML && (config.removeScripts === true || config.replaceImages === true))
					{
						var dom = new jsdom.JSDOM(hostDataHTML);

						if (config.removeScripts === true) removeScripts(dom);
						if (config.replaceImages === true) replaceImages(dom);

						var hostHTML = dom.serialize().replace(/"/g, '&quot;');

						htmlFiles[i].push('<div class="item"><iframe seamless sandbox srcdoc="' + hostHTML + '"></iframe><div class="itemURL"><a href="http://' + host.host + '">' + host.host + '</a></div></div>');
					}

				});

				htmlFiles[i].push(htmlMenu);
				htmlFiles[i].push(config.htmlFooter);
			});

			htmlFiles.forEach(function(page, i)
			{
				if (!isFile(path.join(outDirName, inFileName, outFileName, outFileName + '-' + i + '.html'))) fs.writeFile(path.join(outDirName, inFileName, outFileName, outFileName + '-' + i + '.html'), page.join('\n\n'));
				else
				{
					log('File exists. Renaming..');
					fs.writeFile(path.join(outDirName, inFileName, outFileName, outFileName + '-' + i + '.html' + '-' + getTime(new Date())), page.join('\n\n'));
				}
			});

			log('Finish: ' + getTime(new Date()));
		}
	});

	log('Start: ' + getTime(new Date()));
	log('Files will be in: ' + path.join(outDirName, inFileName, outFileName));
})();