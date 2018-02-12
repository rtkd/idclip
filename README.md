### Find strings in Project Sonar HTTP data ###

Accepts 3 parameters: 1. Regular Expression 2. Infile 3. Outfile.<br>
Returns: Matched hosts as JSON and HTML.

### Options ###

```js
var config =
{
	'buildHTML': true, // Build HTML files. Default: true.
	'removeScripts': true, // Remove scripts from host HTML. Default: true.
	'replaceImages': true, // Replace images in host HTML. Default: true.
	'hostsPerHTMLFile': 500, // Number of hosts per HTML file. Default: 500.
	'logInterval': 60000, // How often to log progress to console. Default: 60000.

	'happyKitten': 'http://placehold.it/200x100&text=Image replaced', // Placeholder image
	'logFile': 'log/.log', // Log file
	'htmlHeader': '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;}nav a{display:inline-block;padding:1rem;}.item{display:inline-block;}.itemURL{margin-bottom:1rem;}</style></head><body>', // HTML Header
	'htmlFooter': '</body></html>' // HTML Footer
};
```

### WARNING ###

Use at own risk!<br>
<br>
There is abolutely no warranty every script or image is removed from host HTML!<br>
Scripts within attributes or CSS or SVG will pass through untouched!<br>
Images within CSS will pass through untouched!<br>

### Run ###

```bash
$ node find.js <regex> <infile> <outfile>
```

### Example ###

```bash
$ node --max-old-space-size=8192 find.js '\b3301\b' 20141223-http.json 3301.json
```

### Bugs ###

There is a limit to the string length Array.join() can handle.<br>
So if your RegEx is too unspecific and matches too many hosts, the script will crash when building output files.