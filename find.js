var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var logInterval = 60000;
var hostPerFile = 1000;

var cmd = process.argv.slice(2);

var regex = new RegExp(cmd[0], 'i');

var instream = fs.createReadStream(cmd[1]);
var rl = readline.createInterface(instream);
var i = 0, j = 0, matches = [];

rl.on('line', function(line)
{
	var item = JSON.parse(line);

	var data = new Buffer(item.data, 'base64').toString('utf8');

	if (regex.test(data))
	{
		item.data = data;

		matches.push(item);

		j ++;
	}

	i ++;
});

rl.on('close', function()
{
	clearInterval(status);

	var json = [], html  = ['<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'];

	matches.forEach(function(item)
	{
		json.push(JSON.stringify(item));

		item.data = item.data.match(/<html([\s\S]*?)html>/ig);

		item.data = item.data ? item.data : 'No HTML';

		html.push('<div style="display:inline-block;"><iframe seamless sandbox srcdoc="' + item.data.toString().replace(/"/g, '&quot;') + '"></iframe><div style="margin-bottom:1rem;"><a href="http://' + item.host + '">' + item.host + '</a></div></div>');
	});

	html.push('</body></html>');

	fs.writeFile(cmd[2], json.join('\n'));

	fs.writeFile(cmd[2] + '.html', html.join('\n\n\n\n\n'));

	fs.appendFile('log/.log', cmd[0] + ' // ' + cmd[1] + ' // ' + cmd[2] + ' // ' + j + ' Hosts\n');

	console.log('End: ' + getTime(new Date()));
});

var getTime = function(date)
{
	var h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();

	return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
};

var logProgress = function() { console.log('Done: ' + i + ' / Hosts: ' + j); };

var status = setInterval(logProgress, logInterval);

console.log('Start: ' + getTime(new Date()));

