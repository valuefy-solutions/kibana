/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { fromEventPattern, of } from 'rxjs';
import { concatMap, delay, map } from 'rxjs/operators';
import jsonStream from './json_stream';
import { pipe, noop } from './utils';
import { ingest } from './ingest';
import {
  staticSite,
  statsAndCoveredFilePath,
  addPath,
  testRunner,
  timeStamp,
  distro,
  buildId,
  maybeDropCoveredFilePath,
} from './conversions';

const ms = process.env.DELAY || 0;
const staticSiteUrlBase = process.env.STATIC_SITE_URL_BASE || '';

export default ({ coveragePath }, log) => {
  log.debug(`### Code coverage ingestion set to delay for: ${ms} ms\n`);

  const prokStatsTimeStampBuildIdCoveredFilePath = pipe(
    statsAndCoveredFilePath,
    buildId,
    timeStamp,
    staticSite(staticSiteUrlBase)
  );
  const addPathTestRunnerAndDistro = pipe(addPath(coveragePath), testRunner, distro);

  const objStream = jsonStream(coveragePath).on('done', noop);

  fromEventPattern(_ => objStream.on('node', '!.*', _))
    .pipe(
      map(prokStatsTimeStampBuildIdCoveredFilePath),
      map(addPathTestRunnerAndDistro),
      map(maybeDropCoveredFilePath),
      concatMap(x => of(x).pipe(delay(ms)))
    )
    .subscribe(ingest(log));
};
