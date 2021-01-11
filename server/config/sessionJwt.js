'use strict'
const { createSigner, createVerifier } = require('fast-jwt'); //createDecoder

const createToken = (secret, payload) => {
  const signSync = createSigner({key: secret});
  const token = signSync(payload);
  return (token);
}

exports.verifyToken = (req, res, secret, verify) => {
    //try {
      const verifySync = createVerifier({
            key: secret,
            complete: true,
            cache: true,
            ignoreExpiration: false//,
            //algorithms: ['HS256','HS384', 'HS512','RS256']
      })

      const result = verifySync(req.cookies.token)
//    console.log(result.payload.verify, verify);
/*    result format is like {
  	  header: { alg: 'HS256', typ: 'JWT' },
  	  payload: { verify: 'initSession', iat: 1609235926 },
  	  signature: 'CVSdy96UEm86pJCwHRClGUNO6-R4GZHSkkIP8AyZueg'
      } */
      return (result.payload.verify === verify);
      //  res.code(200).send({'success': 'Token verified'});
      //  return next()
      //}
      //})
    /*} catch (err) {
      console.log(err);
      res.code(401).send({'fail': 'Token not verified'});
    }*/
}

exports.setToken = (req, res, secret, verify) => {
    let token, signSync;
//  if (req.cookies.ucode && req.cookies.ucode !== '') {
/* jwt
        token = await res.jwtSign({
          name: req.cookies.ucode + secret,
          role: ['guest', 'true']
        });*/
    token = createToken(secret, {verify: verify}); //{role: "guest", ucode: req.cookies.ucode}
//      } else {
/*      token = await res.jwtSign({
          name: secret,
          role: ['guest', 'false']
        });*/
/*      app.log.info('Warning: No ucode to create token');
        signSync = createSigner({key: mysecret});
        token = signSync({role: "guest", withUcode: false});
*/
//      res.code(400).send({'fail': 'Need ucode in payload'});
//    }
    res
      .header('Access-Control-Allow-Origin', '*')
      .header('Content-Type', 'application/json; charset=utf-8')
      .header('Access-Control-Allow-Credentials',true)
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
      .send({'success': 'Get token'})
}
