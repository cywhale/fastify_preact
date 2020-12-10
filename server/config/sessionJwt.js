'use strict'
const {createSigner, createVerifier} = require('fast-jwt'); //createDecoder

exports.verifyToken = (req, res, secret) => {
    //try {
      const verifySync = createVerifier({
            key: secret,
            complete: true,
            cache: true,
            ignoreExpiration: false//,
            //algorithms: ['HS256','HS384', 'HS512','RS256']
      })

      const payload = verifySync(req.cookies.token) //, (err, sections) => {
        //console.log("Verify JWT callback...");
        //if (err && err !== '') {
        //  console.log(err);
        //  res.code(401).send({'fail': 'Token not vaild. ' + err});
        //  return
        //} else {
          console.log(payload);
          res.code(200).send({'success': 'Token verified'});
        //  return next()
        //}
      //})
    /*} catch (err) {
      console.log(err);
      res.code(401).send({'fail': 'Token not verified'});
    }*/
}

exports.setToken = (req, res, secret) => {
      let token, signSync;
      if (req.cookies.ucode && req.cookies.ucode !== '') {
/* jwt
        token = await res.jwtSign({
          name: req.cookies.ucode + secret,
          role: ['guest', 'true']
        });*/
        signSync = createSigner({key: secret});
        token = signSync({role: "guest", ucode: req.cookies.ucode});
      } else {
/*      token = await res.jwtSign({
          name: secret,
          role: ['guest', 'false']
        });*/
/*      app.log.info('Warning: No ucode to create token');
        signSync = createSigner({key: mysecret});
        token = signSync({role: "guest", withUcode: false});
*/
        res.code(400).send({'fail': 'Need ucode in payload'});
      }

      res
      .header('Access-Control-Allow-Origin', '*')
      .header('Content-Type', 'application/json; charset=utf-8')
      //res.header('Access-Control-Allow-Origin', "http://127.0.0.1:3000");
      //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      .header( 'Access-Control-Allow-Credentials',true)
      .setCookie('token', token, {
        domain: 'eco.odb.ntu.edu.tw',
        path: '/',
        //expires: new Date(Date.now() + 999999),
        maxAge: 1000 * 60 * 60 * 24,
        secure: true, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true //'lax' // alternative CSRF protection
      })
      .code(200)
      .send({'success': 'Init cookie sent'})
}
