'use strict'

//v1.0.0 source: https://codesource.io/build-a-rest-service-with-fastify/
//v1.0.1 modified by cywhale, try a fastify-server with preact client
const fastify = require('fastify');
//const jwt = require('fastify-jwt'); //fastify-jwt works well, try fast-jwt
//const {createSigner, createVerifier} = require('fast-jwt'); //move to sessionJwt.js
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const devTestPort = 3003; // need nginx pass proxy to separate server/client to test /sessioninfo
const db = require('./config/db')
const routes = require('./routes/postRoutes');
const sessionJwt = require('./config/sessionJwt');
const { credentials } = require('./config/credentials');
const { cookieSecret } = credentials
const sessiondir = '/sessioninfo';
const mySecret = credentials.cookieSecret;

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

const startServer = async () => {

  const {key, cert, allowHTTP1} = await configSecServ();
  const app = fastify({
      http2: true,
      trustProxy: true,
      https: {key, cert, allowHTTP1},
      logger: true
  })
/*
  try {
    await app.register(require('fastify-cors'), {
      origin: 'http://localhost:3000',
      credentials: true,
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

  if (PORT !== devTestPort) { // for testing
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
  }

  try {
   await app.register(db);
   //app.use(db())
  } catch {
    app.log.info('Try connect db error');
  }
/*try {
    await app.register(jwt, {
      secret: 'just-test-jwt',
      cookie: {
        cookieName: 'token'
      }
    })
  } catch {
    app.log.info('Try reg fastify-jwt error');
  }
*/
  try {
    await app.register(require('fastify-cookie')); //, {
  //    secret: "just-test-secret",
  //    parseOptions: {}
  //});
  } catch {
    app.log.info('Try reg fastify-cookie error');
  }

  try {
    await app.post(sessiondir + '/init', async (req, res) => {
      if (req.cookies.token) {
        let verifyInit = sessionJwt.verifyToken(req, res, mySecret, 'initSession');

        if (verifyInit) {
          res.code(200).send({'success': 'Verified token already existed'});
        } else {
          res.code(400).send({'fail': 'Init token fail with wrong existed client token'});
        }
      } else {
        //console.log("req.payload is: ", req.body);
        if (req.body.action === 'initSession') {
          sessionJwt.setToken(req, res, mySecret, 'initSession');
        } else {
          res.code(400).send({'fail': 'Init token fail with wrong client action'});
        }
      }
    });
  } catch (err) {
    app.log.info('Sent init cookie error', err);
  }

  try {
    await app.post(sessiondir + '/login', async (req, res) => {
      if (req.cookies.token) {
        let verifyLogin = sessionJwt.verifyToken(req, res, mySecret, 'initSession');

        if (verifyLogin) {
          if (!req.body.user) {
            res.code(400).send({'fail': 'Token ok but no user while login'});
          } else {
            res.code(200).send({'success': 'Token with user: ' + req.body.user});
            //sessionJwt.createToken(mySecret+req.body.user, )
          }
        } else {
          res.code(400).send({'fail': 'Token failed when login verified after init'});
        }

      } else {
        res.code(400).send({'fail': 'Need token in payload'})//);
      }
    });
  } catch (err) {
    app.log.info('Verify after login error', err);
  }
/*
  try {
    await app.addHook('onRequest', (req) => {
      //console.log("jwt verify: ", req);
      req.jwtVerify()
    });
  } catch {
    app.log.info('JWT verify error');
  }

  try {
    await app.get('/verifycookie', (req, res) => {
      //console.log("verify cookie:", req);
      res.send({ code: 'OK', message: 'it works!' })
    })
  } catch {
    app.log.info('Cookie verify error');
  }
*/
  try {
    await routes.forEach((route, index) => {
      app.route(route)
    });
  } catch {
    app.log.info('Try serve each route error');
  }

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
