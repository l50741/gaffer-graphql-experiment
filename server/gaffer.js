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

var request = require('request');
var promise = require('promise');
const API = 'http://localhost:8081/rest/v1';

module.exports = {
    createGraphSeed(seed) {
        let operation = {
            operations: [
                {
                    class: 'uk.gov.gchq.gaffer.operation.impl.get.GetElements',
                    resultLimit: 300,
                    deduplicate: true,
                    seeds: [
                        {
                            class: 'uk.gov.gchq.gaffer.operation.data.EntitySeed',
                            vertex: seed
                        }
                    ],
                    view: {
                        entities: {},
                        edges: {}
                    },
                    includeIncomingOutGoing: 'BOTH'
                }
            ]   
        };
        return this.graphDoOperation(operation);
    },

    getGraphSchema() {
        return new Promise((resolve, reject) => {
            request.get(API + '/graph/schema', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    },

    graphDoOperation(operation) {
        return new Promise((resolve, reject) => {
            request.post({
                url: API + '/graph/doOperation',
                headers: { 'Content-Type': 'application/json' },
                json: operation
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }
};  