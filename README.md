### Find strings in Project Sonar HTTP data ###

Accepts 3 parameters: 1. Regular Expression 2. Infile 3. Outfile.<br>
Returns: Matched hosts as JSON and HTML.

### Options ###

```js
'buildHTML': true, // Build HTML files. Default: true.
'removeScripts': true, // Remove scripts from host HTML. Default: true.
'replaceImages': true, // Replace images in host HTML. Default: true.
'happyKitten': 'http://placehold.it/200x100&text=Image replaced', // Placeholder image.
'hostsPerHTMLFile': 500, // Number of hosts per HTML file. Default: 500.
'logInterval': 60000, // How often to log progress to console. Default: 60000.
'logFile': 'log/.log', // Log file
```

### WARNING ###

Use at own risk!<br>
<br>
There is abolutely no warranty every script or image is removed from host HTML!<br>
Everything but <script> and <img> will pass through untouched!

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