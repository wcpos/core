import * as React from 'react';
import get from 'lodash/get';
import find from 'lodash/find';
import http from '@wcpos/common/src/lib/http';
import Platform from '@wcpos/common/src/lib/platform';
import useAppState from '@wcpos/common/src/hooks/use-app-state';
import Url from '@wcpos/common/src/lib/url-parse';

interface WpJsonResponse {
	authentication: Record<string, unknown>;
	description: string;
	gmt_offset: string;
	home: string;
	name: string;
	namespaces: string[];
	routes: Record<string, unknown>;
	site_logo: string;
	timezone_string: string;
	url: string;
	_links: Record<string, unknown>;
}

const parseApiUrlFromHeaders = (
	headers: import('axios').AxiosResponseHeaders
): string | undefined => {
	const parsed = Url.parseLinkHeader(get(headers, 'link'));
	return get(parsed, ['https://api.w.org/', 'url']);
};

const useSiteConnect = () => {
	const { user, userDB } = useAppState();
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(false);

	const onConnect = React.useCallback(
		async (url: string): Promise<void> => {
			setLoading(true);

			// first get siteData
			let protocol = 'https';
			if (Platform.OS === 'web' && process.env.NODE_ENV === 'development') {
				protocol = 'http';
			}

			const urlWithoutProtocol = url.replace(/^.*:\/{2,}|\s|\/+$/g, '') || '';

			const siteData = await http
				.head(`${protocol}://${urlWithoutProtocol}`)
				.then((response) => {
					const wpApiUrl = parseApiUrlFromHeaders(response.headers);
					if (wpApiUrl) {
						const wcNamespace = 'wc/v3';
						const wcposNamespace = 'wcpos/v1';

						return http.get(wpApiUrl).then((res) => {
							const data = get(res, 'data') as WpJsonResponse;
							const namespaces = get(data, 'namespaces');
							if (!namespaces) {
								throw Error('WordPress API not found');
							}
							if (!namespaces.includes(wcNamespace)) {
								throw Error('WooCommerce API not found');
							}
							if (!namespaces.includes(wcposNamespace)) {
								throw Error('WooCommerce POS API not found');
							}
							return {
								...data,
								wpApiUrl,
								wcApiUrl: `${wpApiUrl}wc/v3`,
								wcApiAuthUrl: `${wpApiUrl}wcpos/v1/jwt`,
							};
						});
					}
					throw Error('Site does not seem to be a WordPress site');
				})
				.catch((err) => {
					setError(err.message);
					setLoading(false);
				});

			if (siteData) {
				// check against database
				// populate user sites
				const sites = await user.populate('sites').catch((err) => {
					console.error(err);
				});
				const existingSite = find(sites, { url: siteData?.url });

				// if not existingSite, then insert site data
				if (!existingSite) {
					const newSite = await userDB.sites.insert(siteData); // note: insertApiData

					user.update({ $push: { sites: newSite?.localID } }).catch((err) => {
						console.log(err);
						return err;
					});
				} else {
					debugger;
				}

				setLoading(false);
			}
		},
		[user, userDB]
	);

	return { onConnect, loading, error };
};

export default useSiteConnect;