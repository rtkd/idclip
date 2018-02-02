### Find strings in Project Sonar HTTP Data ###

Accepts 3 parameters: 1. Regex 2. Infile 3. Outfile

### Run ###

```bash
$ node find.js <regex> <infile> <outfile>
```

### Example ###

```bash
$ node find.js '\b3301\b' 20141223-http.json 3301.json
```