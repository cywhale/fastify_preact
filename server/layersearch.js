module.exports = async function layersearch (app, opts, next) {
  const { db } = app.mongo.mongo1
  const layerprops = db.collection('layerprops')

  try {
    await app.get('/:name', /*{
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              value: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string' },
              format: { type: 'string' },
              metagroup: { type: 'string' }
            }
          }
        }
      },*/
      (req, reply) => {
      //console.log("req.param: ", req.params);
      layerprops.findOne({$or:[
        {value: {$regex: req.params.name, $options: "ix"} },
        {label: {$regex: req.params.name, $options: "ix"} }
        ]},
        onFind
      )
      async function onFind (err, layer) {
        if (err) {
          await reply.send({"fail": "Layers not found"})
        } else {
          await reply.code(200).send(layer)
        }
      }
    })
  } catch (err) {
    app.log.info('Sent init cookie error', err);
  }
  next()
}
