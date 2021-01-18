module.exports = async function layersearch (app, opts, next) {
  const { db } = app.mongo.mongo1;
  const layerprops = db.collection('layerprops');
//can refer: https://github.com/Cristiandi/demo-fastify/blob/master/src/routes/api/persons/schemas.js
//see: https://developer.ibm.com/tutorials/learn-nodejs-mongodb/
  const selLayerSchema = {
              //_id: { type: 'string' },
              value: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string' },
              format: { type: 'string' },
              metagroup: { type: 'string' }
            };
  try {
    await app.get('/:name', {
      schema: {
        tags: ['layers'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              //required: ['value', 'label', 'type', 'format'],
              properties: selLayerSchema
            }
          }
        }
      }
    },
    (req, reply) => {
      //console.log("req.param: ", req.params);
      //const layers =
      layerprops.find({$or:[
        {value: {$regex: req.params.name, $options: "ix"} },
        {label: {$regex: req.params.name, $options: "ix"} },
        {metagroup: {$regex: req.params.name, $options: "ix"} }
        ]}//,
        //onFind
      ).toArray(async (err, layer) => {
      //async function onFind (err, layer) {
        if (err) {
          console.log("Error when searching in Mongo: ", err);
          await reply.send({});
        } else {
          //await console.log("layers found in Mongo: ", layer);
          await reply.send(layer);
        }
      })
    })
  } catch (err) {
    app.log.info('Error when trying to search: ', err);
  }
  next()
}
