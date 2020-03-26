/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import React, { useContext } from 'react';
import { UICapabilities } from 'ui/capabilities';
import { injectUICapabilities } from 'ui/capabilities/react';
import { SnapshotPageContent } from './page_content';
import { SnapshotToolbar } from './toolbar';

import { DocumentTitle } from '../../../components/document_title';
import { NoIndices } from '../../../components/empty_states/no_indices';
import { ColumnarPage } from '../../../components/page';

import { SourceErrorPage } from '../../../components/source_error_page';
import { SourceLoadingPage } from '../../../components/source_loading_page';
import {
  ViewSourceConfigurationButton,
  ViewSourceConfigurationButtonHrefBase,
} from '../../../components/source_configuration';
import { Source } from '../../../containers/source';
import { WithWaffleFilterUrlState } from '../../../containers/waffle/with_waffle_filters';
import { WithWaffleOptionsUrlState } from '../../../containers/waffle/with_waffle_options';
import { WithWaffleTimeUrlState } from '../../../containers/waffle/with_waffle_time';
import { WithKibanaChrome } from '../../../containers/with_kibana_chrome';
import { useTrackPageview } from '../../../hooks/use_track_metric';

interface SnapshotPageProps {
  uiCapabilities: UICapabilities;
}

export const SnapshotPage = injectUICapabilities((props: SnapshotPageProps) => {
  const { uiCapabilities } = props;
  const {
    createDerivedIndexPattern,
    hasFailedLoadingSource,
    isLoading,
    loadSourceFailureMessage,
    loadSource,
    metricIndicesExist,
  } = useContext(Source.Context);

  useTrackPageview({ app: 'infra_metrics', path: 'inventory' });
  useTrackPageview({ app: 'infra_metrics', path: 'inventory', delay: 15000 });

  return (
    <ColumnarPage>
      <DocumentTitle
        title={(previousTitle: string) =>
          i18n.translate('xpack.infra.infrastructureSnapshotPage.documentTitle', {
            defaultMessage: '{previousTitle} | Inventory',
            values: {
              previousTitle,
            },
          })
        }
      />
      {isLoading ? (
        <SourceLoadingPage />
      ) : metricIndicesExist ? (
        <>
          <WithWaffleTimeUrlState />
          <WithWaffleFilterUrlState indexPattern={createDerivedIndexPattern('metrics')} />
          <WithWaffleOptionsUrlState />
          <SnapshotToolbar />
          <SnapshotPageContent />
        </>
      ) : hasFailedLoadingSource ? (
        <SourceErrorPage errorMessage={loadSourceFailureMessage || ''} retry={loadSource} />
      ) : (
        <WithKibanaChrome>
          {({ basePath }) => (
            <NoIndices
              title={i18n.translate('xpack.infra.homePage.noMetricsIndicesTitle', {
                defaultMessage: "Looks like you don't have any metrics indices.",
              })}
              message={i18n.translate('xpack.infra.homePage.noMetricsIndicesDescription', {
                defaultMessage: "Contact your System Administrator",
              })}
              actions={null}
              data-test-subj="noMetricsIndicesPrompt"
            />
          )}
        </WithKibanaChrome>
      )}
    </ColumnarPage>
  );
});
