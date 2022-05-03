let http = require('http');
let url = require('url');
let static = require('node-static');
let fileServer = new static.Server('.');
let users = [];

async function recognize(req, res) {
    let urlParsed = url.parse(req.url, true);
    let user = users.find(u => u.nick === urlParsed.query.user);

    //GET
    if (urlParsed.pathname == '/getMessage') {
        //add to user object current response
        users.find(user => user.nick == urlParsed.query.user).response = res
        return;
    }
    // sending a message
    //POST
    if (urlParsed.pathname == '/sendMessage' && req.method == 'POST') {
        req.setEncoding('utf8');
        let message = '';
        req.on('data', function (chunk) {
            message += chunk;
        }).on('end', function () {

            let text2 = message.split(" ")
            if (text2[0] == "/users") {
                obj = "/users Użytkownicy obecni : "
                users.forEach(user => {
                    obj += user.nick + ", "
                })
                message = obj
            }

            if (text2[0] == "/color") {
                let color1 = "#" + Math.floor(Math.random() * 16777215).toString(16)
                users.forEach(userx => {
                    if (userx.nick == user.nick) {
                        userx.color = color1
                        user = users.find(u => u.nick === urlParsed.query.user);
                    }
                })
                message = "/color"
            }


            let usr = {
                color: user.color,
                nick: user.nick,
            }
            users.forEach(e => {
                let res = e.response;
                res.end(JSON.stringify({ message, usr }))
            })
            res.end("ok");
        });
        return;
    }

    //LOGGIN
    if (urlParsed.pathname == '/Login' && req.method == 'POST') {
        let user_log = users.find(user => user.nick == urlParsed.query.user)
        if (!user_log) {
            users.push({
                color: "#" + Math.floor(Math.random() * 16777215).toString(16),
                nick: urlParsed.query.user,
                timestamp: Date.now()
            });
            res.end()
        }
        //RETURN 404 IF USER EXISTS
    }


    fileServer.serve(req, res);
}

if (require.main.children) {
    http.createServer(recognize).listen(8080);
} else {
    users.forEach(e => {
        let res = e.response;
        res.end()
    })
}