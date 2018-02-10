### Find strings in Project Sonar HTTP data ###

Accepts 3 parameters: 1. Regular Expression 2. Infile 3. Outfile.<br>
Returns: Matched hosts as JSON and HTML.

### Options ###

```js
var buildHTML = true; // Build HTML files. Default: true.
var removeScripts = true; // Remove scripts from host HTML. Default: true.
var replaceImages = true; // Replace images in host HTML. Default: true.
var logInterval = 60000; // How often to log progress to console. Default: 60000.
var hostPerFile = 500; // Number of hosts per HTML file. Default: 500.
```

### WARNING ###

Use at own risk!<br>
<br>
There is abolutely no warranty every script is removed or every image replaced!<br>
Scripts within attributes or CSS or SVG will pass through untouched!<br>
Images referenced within CSS will pass through untouched!<br>
<br>
Be save, use a VM to look at HTML files!

### Run ###

```bash
$ node find.js <regex> <infile> <outfile>
```

### Example ###

```bash
$ node find.js '\b3301\b' 20141223-http.json 3301.json
```

### Bugs ###

There is a limit to the string length Array.join() can handle.<br>
So if your RegEx is too unspecific and matches too many hosts, the script will crash when building output files.