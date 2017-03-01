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

import { Component, OnInit } from '@angular/core';
import { GafferService } from '../services/gaffer.service';
import { SeedDialogComponent } from './seed.dialog.component';
import { UUID } from 'angular2-uuid';
import { MdDialog } from '@angular/material';

import * as _ from 'lodash';
declare var vis: any;

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  entryComponents: [SeedDialogComponent],
  providers: [GafferService]
})
export class ExploreComponent implements OnInit {

  schema: any;
  network: any;
  container: any;
  events: string;
  operationResult: any;
  errorMessage: any;

  edges: any;
  nodes: any;

  clusterIndex = 0;
  clusters = [];
  lastClusterZoomLevel = 0;
  clusterFactor = 0.9;

  constructor(private gafferService: GafferService, public dialog: MdDialog) { }

  ngOnInit() {
    this.gafferService.getGraphSchema()
      .subscribe(
      graphSchema => this.formatSchema(graphSchema),
      error => this.errorMessage = <any>error);

    this.setupGraph();
  }

  setupGraph() {
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);
    this.container = document.getElementById('mynetwork');
    let data = {
      nodes: this.nodes,
      edges: this.edges
    };
    let options = {
      nodes: {
        shape: 'dot',
        size: 18,
        font: {
          size: 16
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true
      },
      autoResize: true,
      height: '600px'
    };

    this.network = new vis.Network(this.container, data, options);

    this.network.once('initRedraw', function () {
      if (this.lastClusterZoomLevel === 0) {
        this.lastClusterZoomLevel = this.network.getScale();
      }
    });

    this.network.on('zoom', params => this.onZoom(params));
    this.network.on('selectNode', params => this.onSelectNode(params));
  }

  openDialog() {
    let dialogRef = this.dialog.open(SeedDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.createGraphSeed(result);
      }
    });
  }

  addNode(label) {
    let existingNode = _.find(this.nodes._data, { label: label });
    if (!existingNode) {
      this.nodes.add({
        id: UUID.UUID(),
        label: label
      });
    }
  }

  createGraphSeed(seed: String) {
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
    this.addNode(seed);
    this.gafferService.graphDoOperation(operation)
      .subscribe(
      result => this.formatElementOperationResult(result),
      error => this.errorMessage = <any>error);
  }

  onZoom(params) {
    if (params.direction === '-') {
      if (params.scale < this.lastClusterZoomLevel * this.clusterFactor) {
        this.makeClusters(params.scale);
        this.lastClusterZoomLevel = params.scale;
      }
    } else {
      this.openClusters(params.scale);
    }
  }

  onSelectNode(params) {
    _.forEach(params.nodes, (node: any) => {
      this.createGraphSeed(this.nodes._data[node].label);
    });
  }

  makeClusters(scale) {
    let clusterOptionsByData = {
      processProperties: (clusterOptions, childNodes) => {
        this.clusterIndex = this.clusterIndex + 1;
        let childrenCount = 0;
        for (let i = 0; i < childNodes.length; i++) {
          childrenCount += childNodes[i].childrenCount || 1;
        }
        clusterOptions.childrenCount = childrenCount;
        clusterOptions.label = '# ' + childrenCount + '';
        clusterOptions.font = { size: childrenCount * 5 + 30 }
        clusterOptions.id = 'cluster:' + this.clusterIndex;
        this.clusters.push({ id: 'cluster:' + this.clusterIndex, scale: scale });
        return clusterOptions;
      },
      clusterNodeProperties: { borderWidth: 3, shape: 'database', font: { size: 30 } }
    };
    this.network.clusterOutliers(clusterOptionsByData);
    this.network.setOptions({ physics: { stabilization: { fit: false } } });
    this.network.stabilize();
  }

  openClusters(scale) {
    let newClusters = [];
    let declustered = false;
    for (let i = 0; i < this.clusters.length; i++) {
      if (this.clusters[i].scale < scale) {
        this.network.openCluster(this.clusters[i].id);
        this.lastClusterZoomLevel = scale;
        declustered = true;
      } else {
        newClusters.push(this.clusters[i])
      }
    }
    this.clusters = newClusters;
    this.network.setOptions({ physics: { stabilization: { fit: false } } });
    this.network.stabilize();
  }

  saveNodes(data, callback) {
    let test = [data, callback];
  }

  saveEdges(data, callback) {
    let test = [data, callback];
  }

  formatEntity(data) {
    this.nodes.push({
      id: UUID.UUID(),
      group: data.group,
      label: data.vertex,
      class: data.class
    });
  }

  formatEdge(data) {
    this.addNode(data.source);
    this.addNode(data.destination);

    let fromNode: any = _.find(this.nodes._data, { label: data.source });
    let toNode: any = _.find(this.nodes._data, { label: data.destination });

    if (fromNode && toNode) {
      let fromNodeId = fromNode.id;
      let toNodeId = toNode.id;
      let arrows = 'none';
      if (data.hasOwnProperty('directed')) {
        if (data.directed) {
          arrows = 'to';
        }
      }
      let existingEdge: any = _.find(this.edges._data, {
        label: data.group,
        from: fromNodeId,
        to: toNodeId
      });
      if (!existingEdge) {
        this.edges.add({
          id: UUID.UUID(),
          label: data.group,
          from: fromNodeId,
          to: toNodeId,
          arrows: arrows,
          length: 200
        });
      }
    }
  }

  formatEntityOperationResult(result) {
    _.forEach(result, (data: any) => {
      this.formatEntity(data);
    });
  }

  formatEdgeOperationResult(result) {
    _.forEach(result, (data: any) => {
      this.formatEdge(data);
    });
  }

  formatElementOperationResult(result) {
    _.forEach(result, (data: any) => {
      if (data.class === 'uk.gov.gchq.gaffer.data.element.Edge') {
        this.formatEdge(data);
      } else if (data.class === 'uk.gov.gchq.gaffer.data.element.Entity') {
        this.formatEntity(data);
      }
    });
    // let clusterOptions = {
    //   joinCondition: (nodeOptions) => {
    //     return nodeOptions.id;
    //   }
    // };
    // this.network.cluster();
  }

  formatSchema(graphSchema) {
    this.schema = graphSchema;
  }

}
