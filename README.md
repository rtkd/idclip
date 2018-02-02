### Find RegEx in Project Sonar Dump ###

Values speed over memory. Accepts 3 parameters: 1. Regex 2. Infile 3. Outfile

### Install ###

```bash
$ npm install
```

### Run ###

```bash
$ node find.js <regex> <infile> <outfile>
```

### Example ###

```bash
$ node find.js '<!--.*(3301).*-->' 20141223-http.json comment-3301.json
```