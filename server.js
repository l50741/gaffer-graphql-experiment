/*
 * Copyright 2016 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const path = require('path');
const http = require('http');
const config = require('config');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');

const api = require('./server/routes/api');
const gaffer = require('./server/gaffer');
const graphSchema = require('./server/graphql/schema')

const app = express();
require('run-middleware')(app)

graphSchema.getSchema().then(gafferSchema => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'dist')));

  app.use('/api', api);
  app.use('/graphql', graphqlHTTP({
    schema: gafferSchema,
    graphiql: true,
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });

  const port = config.get('server.port') || '3000';
  app.set('port', port);

  const server = http.createServer(app);
  server.listen(port, () => console.log(`API running on localhost:${port}`));
});


