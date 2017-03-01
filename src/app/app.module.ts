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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterializeDirective } from 'angular2-materialize';
import { Ng2Webstorage } from 'ng2-webstorage';
import * as spinner from 'ng2-spin-kit/app/spinners';

import { AppComponent } from './app.component';
import { ExploreComponent } from './explore/explore.component';
import { SeedDialogComponent } from './explore/seed.dialog.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { routing } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    ExploreComponent,
    SeedDialogComponent,
    VisualisationComponent,
    DashboardComponent,
    MaterializeDirective,
    spinner.FoldingCubeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule.forRoot(),
    MaterialModule.forRoot(),
    ReactiveFormsModule,
    Ng2Webstorage,
    routing
  ],
  entryComponents: [SeedDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
