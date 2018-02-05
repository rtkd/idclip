var fs = require('fs');
var path = require('path');
var readline = require('readline');
var stream = require('stream');
var jsdom = require('jsdom');

var removeScripts = true;
var replaceImages = true;
var logInterval = 60000;
var hostPerFile = 500;

var cmd = process.argv.slice(2);

var regex = new RegExp(cmd[0], 'i');

var inPath = path.dirname(cmd[1]);
var inFile = path.basename(cmd[1]);

var outPath = path.dirname(cmd[2]);
var outFile = path.basename(cmd[2]);
var outFileExt = path.extname(cmd[2]);
var outFolder = path.basename(cmd[2], outFileExt);

var inStream = fs.createReadStream(cmd[1]);
var readLine = readline.createInterface(inStream);

var current = 0, match = 0, matches = [];

readLine.on('line', function(line)
{
	var item = JSON.parse(line);

	var data = new Buffer(item.data, 'base64').toString('utf8');

	if (regex.test(data))
	{
		item.data = data;

		matches.push(item);

		match ++;
	}

	current ++;
});

readLine.on('close', function()
{
	clearInterval(status);

	var  files = [], json = [], html = [], htmlHead  = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;}nav a{display:inline-block;padding:1rem;}.item{display:inline-block;}.itemURL{margin-bottom:1rem;}</style></head><body>', htmlFoot = '</body></html>';

	var i = 0, j = 0, matchesLength = matches.length;

	matches.forEach(function(item) { json.push(JSON.stringify(item)); });

	while (i < matchesLength)
	{
		files[j] = matches.slice(i, i += hostPerFile);

		j ++;
	}

	files.forEach(function(file, i)
	{
		html[i] = [];

		html[i].push(htmlHead);

		var menu = '<nav>';

		for (var j = 0; j < files.length; j ++)
		{
			menu += '<a href="' + path.basename(cmd[2], '.json') + '-' + j + '.html' + '">' + j + '</a>';
		}

		menu += '</nav>';

		html[i].push(menu);

		file.forEach(function(host)
		{
			var hostDataHTML = host.data.match(/<html([\s\S]*?)html>/ig);

			hostDataHTML = hostDataHTML ? hostDataHTML.toString() : 'No HTML';

			var { JSDOM } = jsdom;

			var dom = new JSDOM(hostDataHTML);

			if (removeScripts === true)
			{
				var headScript = dom.window.document.querySelectorAll('head script');
				var bodyScript = dom.window.document.querySelectorAll('body script');

				for (var key1 in headScript)
				{
					if (headScript.hasOwnProperty(key1))
					{
						headScript[key1].remove();
					}
				}

				for (var key2 in bodyScript)
				{
					if (bodyScript.hasOwnProperty(key2))
					{
						bodyScript[key2].remove();
					}
				}
			}

			if (replaceImages === true)
			{
				var images = dom.window.document.querySelectorAll('img');

				for (var key3 in images)
				{
					if (images.hasOwnProperty(key3))
					{
						images[key3].src = 'http://placehold.it/200x100&text=IMAGE REPLACED';
					}
				}
			}

			hostDataHTML = dom.serialize();

			var hostHTML = hostDataHTML ? hostDataHTML.replace(/"/g, '&quot;') : 'No HTML';

			html[i].push('<div class="item"><iframe seamless sandbox srcdoc="' + hostHTML + '"></iframe><div class="itemURL"><a href="http://' + host.host + '">' + host.host + '</a></div></div>');
		});

		html[i].push(menu);

		html[i].push(htmlFoot);

	});


	fs.mkdirSync(path.join(outPath, outFolder));

	html.forEach(function(page, i)
	{
		fs.writeFile(path.join(outPath, outFolder, outFolder + '-' + i + '.html'), page.join('\n\n'));
	});

	fs.writeFile(path.join(outPath, outFolder, outFile), json.join('\n'));

	fs.appendFile('log/.log', cmd[0] + ' // ' + path.join(inPath, inFile) + ' // ' + path.join(outPath, outFolder, outFile) + ' // ' + match + ' Hosts\n');

	console.log('End: ' + getTime(new Date()));

});

var getTime = function(date)
{
	var h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();

	return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
};

var logProgress = function() { console.log('Done: ' + current + ' / Hosts: ' + match); };

var status = setInterval(logProgress, logInterval);

console.log('Start: ' + getTime(new Date()));

