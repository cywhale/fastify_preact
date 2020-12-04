'use strict'

//v1.0.0 source: https://codesource.io/build-a-rest-service-with-fastify/
//v1.0.1 modified by cywhale, try a fastify-server with preact client
const fastify = require('fastify'); //Bring in Fastify
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const db = require("./config/db")
const routes = require("./routes/postRoutes");
/*
async function configSecServ(certDir='config') {
  const readCertFile = (filename) => {
    return fs.readFileSync(path.join(__dirname, certDir, filename));
  };
  try {
    const [key, cert] = await Promise.all(
      [readCertFile('privkey.pem'), readCertFile('fullchain.pem')]);
    return {key, cert, allowHTTP1: true};
  } catch {
    console.log("Certifite error...");
    process.exit(1)
  }
}
*/
const startServer = async () => {

//const {key, cert, allowHTTP1} = await configSecServ();
  const app = fastify({
      //http2: true,
      trustProxy: true,
//    https: {key, cert, allowHTTP1},
      logger: true
  })
/*
  try {
    await app.register(require('fastify-cors'), {
      origin: 'http://localhost:3000',
      optionsSuccessStatus: 200
    });
  } catch {
    app.log.info('Try cors error');
  }


  try {
    app.get(function(req, res, next) {
      res.header('Content-Type', 'application/json;charset=UTF-8')
      res.header('Access-Control-Allow-Credentials', true)
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      )
      next()
    })
  } catch {
    app.log.info('Try cors set header got error');
  }
*/
//https://web.dev/codelab-text-compression-brotli
  try {
    await app.get('*.js', (req, res, next) => {
      if (req.header('Accept-Encoding').includes('br')) {
        req.url = req.url + '.br';
        console.log(req.header('Accept-Encoding Brotli'));
        res.set('Content-Encoding', 'br');
        res.set('Content-Type', 'application/javascript; charset=UTF-8');
      } else {
        req.url = req.url + '.gz';
        console.log(req.header('Accept-Encoding Gzip'));
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'application/javascript; charset=UTF-8');
      }
      next();
    });
  } catch {
    app.log.info('Try .br, .gz got error');
  }

  try {
    await app.register(require('fastify-static'), {
      root: path.join(__dirname, '..', 'client/build'),
      prefix: '/',
      prefixAvoidTrailingSlash: true,
      list: true /*{ //true
        format: 'html',
        names: ['index', 'index.html', '/']
      }*/
    });
  } catch {
    app.log.info('Try serve ui/build error');
  }

  try {
   await app.register(db);
   //app.use(db())
  } catch {
    app.log.info('Try connect db error');
  }

  try {
    await app.register(require('fastify-cookie'), {
      secret: "just-test-secret",
      parseOptions: {}
    });
  } catch {
    app.log.info('Try reg cookie error');
  }

  try {
    await app.get("/sessioninfo", function(req, res){
      const aCookie = req.cookies.cookiepolycyagree;
      console.log("req cookies: ", aCookie);
      //const bCookie = res.unsignCookie(req.cookies.cookieSigned);
      //console.log("reply cookie: ", bCookie);
      res
        .setCookie('cookiepolycyagree', '555', {
          //domain: 'example.com',
          //secure: true,
          //httpOnly: false,
          signed: true,
          path: '/'
        }) /*
        .setCookie('test-signed', '0123', {
          path: '/',
          signed: true
        }) */
        //.set('Location', '/') //req.headers.referer || '/'
      //next();
    })
  } catch (err) {
    console.log("set cookie in sessioninfo got err: ", err);
  }

  try {
    await routes.forEach((route, index) => {
      app.route(route)
    });
  } catch {
    app.log.info('Try serve each route error');
  }

/* Declare a route
app.get("/", async () => {
  return {
    Message: "Fastify is On Fire"
  }
})
*/
//Funtion To run the server
  const start = async () => {
    try {
      await app.listen(PORT)
      app.log.info(`server listening on ${app.server.address().port}`)
    } catch (err) {
      app.log.error(err)
      process.exit(1)
    }
  }
  start();
}

startServer();
