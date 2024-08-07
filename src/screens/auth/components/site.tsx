import * as React from 'react';

import get from 'lodash/get';

import useHttpClient from '@wcpos/hooks/src/use-http-client';
import { Avatar } from '@wcpos/tailwind/src/avatar';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@wcpos/tailwind/src/dialog';
import { ErrorBoundary } from '@wcpos/tailwind/src/error-boundary';
import { HStack } from '@wcpos/tailwind/src/hstack';
import { Icon } from '@wcpos/tailwind/src/icon';
import { IconButton } from '@wcpos/tailwind/src/icon-button';
import { Suspense } from '@wcpos/tailwind/src/suspense';
import { Text } from '@wcpos/tailwind/src/text';
import { Tooltip, TooltipTrigger, TooltipContent } from '@wcpos/tailwind/src/tooltip';
import { VStack } from '@wcpos/tailwind/src/vstack';

import { WPUsers } from './wp-users';
import { useT } from '../../../contexts/translations';
import { useVersionCheck } from '../../../hooks/use-version-check';

interface Props {
	user: import('@wcpos/database').UserDocument;
	site: import('@wcpos/database').SiteDocument;
	idx: number;
}

/**
 *
 */
function getUrlWithoutProtocol(url: string) {
	return url?.replace(/^.*:\/{2,}|\s|\/+$/g, '') || '';
}

/**
 *
 */
export const Site = ({ user, site, idx }: Props) => {
	const [deleteDialogOpened, setDeleteDialogOpened] = React.useState(false);
	const t = useT();
	const { wcposVersionPass } = useVersionCheck({ site });
	const http = useHttpClient();

	/**
	 * A bit of a hack to get the latest site info
	 */
	React.useEffect(() => {
		const fetchSiteInfo = async () => {
			const response = await http.get(site.wp_api_url, { params: { wcpos: 1 } });
			const data = get(response, 'data', {});
			site.incrementalPatch({
				wp_version: data?.wp_version,
				wc_version: data?.wc_version,
				wcpos_version: data?.wcpos_version,
				wcpos_pro_version: data?.wcpos_pro_version,
				license: data?.license || {},
			});
		};
		fetchSiteInfo();
	}, []);

	/**
	 * Remove site
	 */
	const handleRemoveSite = React.useCallback(async () => {
		try {
			const latest = site.getLatest();
			await latest.remove();
			await user.incrementalUpdate({
				$pullAll: {
					sites: [latest.uuid],
				},
			});
		} catch (err) {
			throw err;
		}
	}, [site, user]);

	return (
		<>
			<HStack space="lg" className="p-4" style={{ borderTopWidth: idx === 0 ? 0 : 1 }}>
				<Avatar
					source={`https://icon.horse/icon/${getUrlWithoutProtocol(site.url)}`}
					className="w-10 h-10"
				/>
				<VStack className="flex-1">
					<VStack space="xs">
						<Text className="font-bold">{site.name}</Text>
						<Text className="text-sm">{site.url}</Text>
					</VStack>
					{wcposVersionPass ? (
						<ErrorBoundary>
							<Suspense>
								<WPUsers site={site} />
							</Suspense>
						</ErrorBoundary>
					) : (
						<HStack>
							<Icon name="triangleExclamation" className="fill-warning" />
							<Text className="text-warning">{t('Please update your WooCommerce POS plugin')}</Text>
						</HStack>
					)}
				</VStack>
				<Tooltip>
					<TooltipTrigger asChild>
						<IconButton
							name="circleXmark"
							size="lg"
							variant="destructive"
							onPress={() => setDeleteDialogOpened(true)}
						/>
					</TooltipTrigger>
					<TooltipContent>
						<Text>{t('Remove site', { _tags: 'core' })}</Text>
					</TooltipContent>
				</Tooltip>
			</HStack>

			<Dialog
				open={deleteDialogOpened}
				onAccept={handleRemoveSite}
				onOpenChange={setDeleteDialogOpened}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('Remove site', { _tags: 'core' })}</DialogTitle>
					</DialogHeader>
					{t('Remove store and associated users?', { _tags: 'core' })}
					<DialogFooter>
						<DialogClose />
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
