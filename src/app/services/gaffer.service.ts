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

import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GafferService {

  GAFFER_HOST = 'http://localhost:8081/rest/v1';

  constructor(private http: Http) { }

  private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  getGraphSchema(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/schema';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphOperations(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/operations';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphAllFilterFunctions(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/filterFunctions';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphFilterFunctions(inputClass: string): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/filterFunctions/' + inputClass;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphGenerators(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/generators';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphSerialisedFields(className: string): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/serialisedFields/' + className;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphStoreTraits(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/storeTraits';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  getGraphTransformFunctions(): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/transformFunctions';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(gafferUrl, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  graphDoOperation(operation: any): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/doOperation';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(gafferUrl, operation, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  graphDoOperationGetAllElements(operation: any): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/doOperation/get/elements/all';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(gafferUrl, operation, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  graphDoOperationGetAllEntities(operation: any): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/doOperation/get/entities/all';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(gafferUrl, operation, options)
          .map(this.extractData)
          .catch(this.handleError);
  }

  graphDoOperationGetAllEdges(operation: any): Observable<any> {
    let gafferUrl = this.GAFFER_HOST + '/graph/doOperation/get/edges/all';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(gafferUrl, operation, options)
          .map(this.extractData)
          .catch(this.handleError);
  }
}
