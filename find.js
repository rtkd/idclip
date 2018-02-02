var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var logInterval = 60000;

var cmd = process.argv.slice(2);

var regex = new RegExp(cmd[0], 'i');

var instream = fs.createReadStream(cmd[1]);
var rl = readline.createInterface(instream);

var i = 0, j = 0, out = [];

var getTime = function(date)
{
	var h, m, s;

	if (typeof(date) === 'number') { h = Math.floor(date / (3600000) % 60); m = Math.floor(date / (60000) % 60); s = Math.floor(date / 1000 % 60); }

	else { h = date.getHours(); m = date.getMinutes(); s = date.getSeconds(); }

	return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
};

var logProgress = function() { console.log('Done: ' + i + ' / Matches: ' + j + ' / Running: ' + getTime(Date.now() - start)); };

var start = Date.now();
var interval = setInterval(logProgress, logInterval);

console.log('Start: ' + getTime(new Date()));

rl.on('line', function(line)
{
	var item = JSON.parse(line);

	var data = new Buffer(item.data, 'base64').toString('utf8');

	if (regex.test(data))
	{
		item.data = data;
		out.push(JSON.stringify(item));
		j ++;
	}

	i ++;
});

rl.on('close', function()
{
	clearInterval(interval);
	fs.writeFile(cmd[2], out.join('\n'));
	fs.appendFile('log/log', cmd[0] + ' // ' + cmd[2] + ' // ' + j + ' Matches\n');

	console.log('End: ' + getTime(new Date()));
});