const http = require('http');

http.createServer((req, res) => {
	console.log(req.url);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
	res.writeHead(200, {'Content-Type': 'application/json'});
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
	res.end(JSON.stringify({
		code: 0,
		result: [
			{
				name: 'banana',
				value: 0
			}
		]
	}))
}).listen('8002');
