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

const {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');
const GraphQLDate = require('graphql-date')
let gaffer = require('../gaffer');
let stringify = require('json-stringify-safe');
let _ = require('lodash');
let config = require('config');

module.exports = {
    getSchema() {
        return gaffer.getGraphSchema().then(gafferSchema => {
            let typeObjects = {};
            let graphTypeObjects = {};
            let schema = JSON.parse(gafferSchema);
            let gafferEdges = schema.edges;
            let gafferTypes = schema.types;
            let typeLookup = {};
            let conversionLookup = {};
            let setupFieldsArray = [];
            let setupFieldsPointer = 0;

            function setupTypes() {
                let typesConfig;
                if (config.has('graphQL.types')) {
                    typesConfig = config.get('graphQL.types');
                }
                _.forEach(gafferTypes, (type, typeName) => {
                    let graphType;

                    let conversion = function (input) {
                        return input;
                    }
                    switch (type.class) {
                        case 'java.lang.Boolean': {
                            graphType = GraphQLBoolean;
                            break;
                        }
                        case 'java.util.Date': {
                            graphType = GraphQLDate;
                            conversion = function (input) {
                                return new Date(input);
                            }
                            break;
                        }
                        case 'java.lang.Integer': {
                            graphType = GraphQLInt;
                            break;
                        }
                        case 'java.lang.Long': {
                            graphType = GraphQLInt;
                            break;
                        }
                        case 'java.lang.String': {
                            graphType = GraphQLString;
                            break;
                        }
                        default: {
                            console.log('unknown type: ' + typeName + ' - ' + type.class);
                            if (typesConfig) {
                                console.log('found config: ' + JSON.stringify(typesConfig, null, 2));
                                if (typesConfig[typeName]) {
                                    console.log('found single config: ' + JSON.stringify(typesConfig[typeName], null, 2));
                                }
                            }
                            graphType = GraphQLString;
                            conversion = function (input) {
                                return JSON.stringify(input);
                            }
                            break;
                        }
                    }
                    typeLookup[typeName] = {
                        java: type.class,
                        graph: graphType,
                        conversion: conversion
                    };
                    conversionLookup[type.class] = conversion
                });
            }

            function setupFields() {
                let fields = {
                    name: {
                        type: GraphQLString
                    }
                };
                let typeName = setupFieldsArray[setupFieldsPointer];
                setupTypes();
                _.forEach(gafferEdges, (typeEdge, edgeName) => {
                    if (typeEdge.destination === typeName) {
                        if (typeEdge.properties !== undefined) {
                            _.forEach(typeEdge.properties, (property, propertyName) => {
                                fields[propertyName] = {
                                    type: typeLookup[property].graph
                                };
                            });
                        }
                    }
                });

                _.forEach(gafferEdges, (typeEdge, edgeName) => {
                    if (typeEdge.source === typeName) {
                        fields[edgeName] = {
                            type: new GraphQLList(graphTypeObjects[typeEdge.destination]),
                            resolve(parent, args, ast, info) {
                                return gaffer.createGraphSeed(parent.name).then(result => {
                                    let array = [];
                                    _.forEach(result, (resultObject) => {
                                        if (resultObject.group === info.fieldName) {
                                            let pushObject = {
                                                name: resultObject.destination
                                            }
                                            if (resultObject.properties !== undefined) {
                                                _.forEach(resultObject.properties, (property, propertyName) => {
                                                    _.forEach(property, (propertyValue, propertyType) => {
                                                        pushObject[propertyName] = conversionLookup[propertyType](propertyValue);
                                                    });
                                                });
                                            }
                                            array.push(pushObject);
                                        }
                                    });
                                    return array;
                                });
                            }
                        }
                    }
                });
                setupFieldsPointer++;
                return fields;
            }

            /**
             * For each edge in the schema, built a type for both the source and destination
             */
            _.forEach(gafferEdges, (edge) => {
                if (typeObjects[edge.source] === undefined) {
                    typeObjects[edge.source] = {
                        name: edge.source,
                        fields: setupFields
                    };
                }
                if (typeObjects[edge.destination] === undefined) {
                    typeObjects[edge.destination] = {
                        name: edge.destination,
                        fields: setupFields
                    };
                }
            });

            _.forEach(typeObjects, (type, typeName) => {
                graphTypeObjects[typeName] = new GraphQLObjectType(type);
            });

            let query = {
                name: 'RootQueryType',
                fields: {}
            };

            /**
             * Add each of the new GraphQLObjectTypes to the query as root parameters, along with a generic
             * 'name' argument
             */
            _.forEach(graphTypeObjects, (type, objectName) => {
                setupFieldsArray.push(objectName);
                query.fields[objectName] = {
                    type: type,
                    args: {
                        name: {
                            type: new GraphQLNonNull(GraphQLString)
                        }
                    },
                    resolve: (root, { name }) => {
                        return {
                            name: name
                        };
                    }
                }
            });

            /**
             * Build the graph schema and process all the 'fields' functions
             */
            return new GraphQLSchema({
                query: new GraphQLObjectType(query)
            });
        });
    }
};  