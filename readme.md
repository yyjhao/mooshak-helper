# Mooshak Grading Helper

This node.js script downloads all your students' last ACed and failed code
and organize them nicely into folders so that you don't have to keep
logging in/out to download each's code.

## How to use
First you must have node.js installed

After you download this project, run

```
npm install
```

Then setup a config.json containing all your students' login, password and names.
Take a look at config.example.json for the format.

When everything's set up, run

```
node app.js [contest name] [download path]
```

`[contest name]` will be something like `CS2010_PS1`.
