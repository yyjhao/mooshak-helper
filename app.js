var Fetcher = require("./fetcher"),
    config = require("./config.json"),
    fs = require("fs"),
    path = require("path");

var downloadDir = path.resolve(__dirname, process.argv[3]);

try{
    fs.mkdirSync(downloadDir);
}catch(e){
    if(e.code !== 'EEXIST'){
        console.log(e);
        throw "Failed to create directory";
    }
}

var tasks = config.students.map(function(s){
    return Fetcher(s.username, s.password, s.name, process.argv[2], downloadDir);
});

for(var i = 0; i < tasks.length; i++){
    setTimeout((function(t){
        return function(){
            t.tryLoginAndGet();
        };
    })(tasks[i]), i * 5000);
}