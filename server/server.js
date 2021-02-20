'use strict'
//v1.0.0 source: https://codesource.io/build-a-rest-service-with-fastify/
//v1.0.1 modified by cywhale, try a fastify-server with preact client
//v1.0.4 refer fastify-cli & fastify-example: https://github.com/delvedor/fastify-example
import Fastify from 'fastify'
import { readFileSync } from 'fs'
import Env from 'fastify-env'
import S from 'fluent-json-schema'
import { join } from 'desm'
import App from './app.js'

async function configSecServ(certDir='config') {
  //const __dirname = path.resolve();
  const readCertFile = (filename) => {
    return readFileSync(join(import.meta.url, certDir, filename)) //path.join(__dirname, certDir, filename))
  }
  try {
    const [key, cert] = await Promise.all(
      [readCertFile('privkey.pem'), readCertFile('fullchain.pem')]
    )
    return {key, cert, allowHTTP1: true}
  } catch {
    console.log("Certifite pem error...");
    process.exit(1)
  }
}

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  const {key, cert, allowHTTP1} = await configSecServ()
  const fastify = Fastify({
      http2: true,
      trustProxy: true,
      https: {key, cert, allowHTTP1},
      logger: true
  })

  fastify.register(Env, {
  //confKey: 'config',
    dotenv: {
      path: join(import.meta.url, '.env'), //`${__dirname}/.env`,
    //debug: true
    },
    schema: S.object()
      //.prop('NODE_ENV', S.string().required())
      .prop('COOKIE_SECRET', S.string().required())
      .prop('MONGO_CONNECT', S.string().required())
      .valueOf()
  }).ready((err) => {
    if (err) console.error(err)
  //console.log("fastify config: ", fastify.config)
  })

  fastify.register(App)

  const start = async () => {
    try {
      await fastify.listen(PORT)
      fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()
}

startServer();
