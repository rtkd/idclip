var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var cmd = process.argv.slice(2);
var regex = new RegExp(cmd[0], 'i');

var instream = fs.createReadStream(cmd[1]);
var rl = readline.createInterface(instream);

var i = 0, j = 0, out = [];

var getTime = function(date)
{
	var h, m, s;

	if (typeof(date) === 'object')
	{
		h = date.getHours();
		m = date.getMinutes();
		s = date.getSeconds();
	}

	else
	{
		h = Math.floor(date / (1000 * 60 * 60) % 60);
		m = Math.floor(date / (1000 * 60) % 60);
		s = Math.floor(date / 1000 % 60);
	}

	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;
	s = s < 10 ? '0' + s : s;

	return h + ':' + m + ':' + s;
};

var log = function() { console.log('Done: ' + i + ' / Matches: ' + j + ' / Running: ' + getTime(Date.now() - start)); };

var start = Date.now();
var interval = setInterval(log, 30000);

console.log('Start: ' + getTime(new Date()));

rl.on('line', function(line)
{
	item = JSON.parse(line);

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

	console.log('End: ' + getTime(new Date()));
});