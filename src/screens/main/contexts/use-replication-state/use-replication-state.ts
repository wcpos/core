import * as React from 'react';

import difference from 'lodash/difference';
import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';
import { defaultHashSha256, RxDocument, RxCollection } from 'rxdb';
import { replicateRxCollection, RxReplicationState } from 'rxdb/plugins/replication';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

import log from '@wcpos/utils/src/logger';

import { getAndPatchRecentlyModified } from './audit.helpers';
import { defaultPrepareQueryParams, retryWithExponentialBackoff } from './replication.helpers';
import useAudit from './use-audit';
import useLocalData from '../../../../contexts/local-data';
import useRestHttpClient from '../../hooks/use-rest-http-client';

import type { QueryObservable, QueryState } from '../use-query';

export type ReplicationState = RxReplicationState<RxDocument, object>;

/**
 *
 */
const replicationStateRegistry = new Map();

interface Props {
	collection: RxCollection;
	query$: QueryObservable;
	prepareQueryParams?: (
		params: ReturnType<typeof defaultPrepareQueryParams>,
		query: QueryState,
		status: any,
		batchSize: number
	) => Record<string, string>;
	pollingTime?: number;
	apiEndpoint?: string;
}

const maxRequests = 5;

/**
 *
 */
export const useReplicationState = ({
	collection,
	query$,
	prepareQueryParams,
	pollingTime = 600000,
	apiEndpoint,
}: Props) => {
	const [replicationState, setReplicationState] = React.useState<ReplicationState | null>(null);
	const query = useObservableState(query$, query$.getValue());
	const { site, store } = useLocalData();
	const apiURL = useObservableState(site.wc_api_url$, site.wc_api_url);
	const http = useRestHttpClient();
	const hashRef = React.useRef(null);
	const endpoint = apiEndpoint || collection.name;
	const audit = useAudit({ collection, endpoint });
	const requestCountRef = React.useRef(0);

	/**
	 * TODO - if initialFullSync is true, maybe I should debounce the query to stop flooding the server
	 */
	React.useEffect(() => {
		// storeID is required because cashiers can switch stores
		// endpoint is required for variations
		const hash = defaultHashSha256(JSON.stringify({ storeID: store.localID, endpoint, query }));
		hashRef.current = hash;

		if (!replicationStateRegistry.has(hash)) {
			// Cancel the previous replicationState if it exists
			if (replicationState) {
				replicationState.cancel();
				// replicationState.abortController.abort();
			}

			// create a new AbortController for each request
			// const controller = new AbortController();

			// Create a new replicationState instance and start it
			const newReplicationState = replicateRxCollection({
				collection,
				replicationIdentifier: `replication-to-${apiURL}/${endpoint}`,
				// push: {
				// 	handler: async () => Promise.resolve([]),
				// },
				pull: {
					handler: async (rxdbCheckpoint, batchSize) => {
						if (requestCountRef.current >= maxRequests) {
							requestCountRef.current = 0;
							return {
								documents: [],
							};
						}
						requestCountRef.current += 1;

						return retryWithExponentialBackoff(async () => {
							try {
								const status = await audit.run();

								const defaultParams = defaultPrepareQueryParams(query, status, batchSize);
								const params = prepareQueryParams
									? prepareQueryParams(defaultParams, query, status, batchSize)
									: defaultParams;

								// hack to stop the API from returning all docs, how to search by uuid?
								if ('uuid' in params) {
									return {
										documents: [],
									};
								}

								// special case for includes
								if ('include' in params) {
									// include should check if they are all in the local db
								}

								// convert includes and excludes to comma separated string
								if ('include' in params && Array.isArray(params.include)) {
									params.include = params.include.join(',');
								}

								if ('exclude' in params && Array.isArray(params.exclude)) {
									params.exclude = params.exclude.join(',');
								}

								/**
								 * FIXME: Hack to fix the issue with rxdb silently dropping lastModified data
								 */
								if (params.modified_after) {
									await getAndPatchRecentlyModified(
										params.modified_after,
										collection,
										endpoint,
										http
									);
									return {
										documents: [],
									};
								}

								const response = await http.get(endpoint, {
									// signal: controller.signal,
									params,
								});
								const data = get(response, 'data', []);

								return {
									documents: data.concat(status.remove),
								};
							} catch (error) {
								log.error(error);
								throw error;
							}
						});
					},
					batchSize: 10,
					modifier: async (doc) => {
						const parsedData = collection.parseRestResponse(doc);
						await collection.upsertRefs(parsedData); // upsertRefs mutates the parsedData
						return parsedData;
					},
					stream$: interval(pollingTime).pipe(map(() => 'RESYNC')),
				},
			});

			// newReplicationState.abortController = controller;
			replicationStateRegistry.set(hash, newReplicationState);
		}

		setReplicationState(replicationStateRegistry.get(hash));

		// Clean up on component unmount or when state changes
		return () => {
			const currentReplicationState = replicationStateRegistry.get(hashRef.current);

			if (currentReplicationState) {
				currentReplicationState.cancel();
				// currentReplicationState.abortController.abort();
				replicationStateRegistry.delete(hashRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// no replicationState
		collection,
		query,
		apiURL,
		http,
		pollingTime,
		requestCountRef,
	]);

	return replicationState ? Object.assign(replicationState, { audit }) : null;
};