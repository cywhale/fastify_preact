/* old version, remove it since v1.0.4, 202102 */
const env = process.env.NODE_ENV || "development"
const credentials = require(`./.credentials.${env}`)

module.exports = {
  credentials,
}

