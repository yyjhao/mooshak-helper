var config = require("./config.json"),
    Browser = require("zombie"),
    fs = require("fs");

module.exports = function(username, password, displayName, contest, dir){
    var r = {};

    var browser = new Browser();
    browser.runScripts = true;

    var base;
    var tryLoginAndGet = r.tryLoginAndGet = function(callback){
        console.log("Trying", displayName);
        browser.visit("http://algorithmics.comp.nus.edu.sg/~mooshak/cgi-bin/execute").then(function(){
            return browser.pressButton("Login");
        }).then(function(){
            return browser.fill("user", username)
                   .fill("password", password)
                   .select("contest", contest).wait(6000);
        }).then(function(){
            if(("" + browser.cookies[1]).indexOf("team") === -1){
                throw "Failed to login";
            }
            base = browser.location.toString();
            return browser.visit(base + "?guest");
        }).then(function(){
            return browser.visit(base +
                "?all_problems=on&page=0&teams=" +
                username +
                "&type=submissions&lines=100&time=1000&command=listing");
        }).then(function(){
            var rows = browser.querySelectorAll(".Listing tr:not(.Header)");
            if(rows.length === 0){
                throw "Invalid page";
            }
            var ac = {},
                lastFail = {},
                failReason = {};
            for(var i = 0; i < rows.length; i++){
                if(rows[i].children.length === 1) break;
                var qn = rows[i].children[4].textContent,
                    state = rows[i].children[6].children[0].textContent,
                    link = rows[i].children[0].children[0].href;

                if(state.indexOf("Accepted") !== -1){
                    if(!ac[qn]){
                        ac[qn] = link;
                    }
                    lastFail[qn] = null;
                } else {
                    if(!ac[qn] && !lastFail[qn]){
                        lastFail[qn] = link;
                        failReason[qn] = state.trim().split(" ").join("");
                    }
                }
            }
            console.log("All info about " + displayName + " gotten");
            var bp = dir + "/" + displayName.split(" ").join("_");
            fs.mkdir(bp, function(e){
                if(!e || (e && e.code === 'EEXIST')){
                    for(var k in ac){
                        // write the downloaded file to disk
                        var filePath = bp + "/" + k + "_ac.java";
                        browser.resources.get(ac[k], (function(filePath){
                            return function(e, re){
                                fs.writeFile(filePath, re.body);
                            };
                        })(filePath));
                    }
                    for(k in lastFail){
                        if(lastFail[k]){
                            var filePath = bp + "/" + k + "_" + failReason[k] + ".java";
                            browser.resources.get(lastFail[k], (function(filePath){
                                return function(e, re){
                                    fs.writeFile(filePath, re.body);
                                };
                            })(filePath));
                        }
                    }
                } else {
                    console.log(e);
                }
            });
        }).fail(function(error){
            console.log(error);
            console.log(displayName, "Fail!");
            tryLoginAndGet();
        });
    };

    return r;
};

