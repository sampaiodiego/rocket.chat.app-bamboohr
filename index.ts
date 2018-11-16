import { IConfigurationExtend, ILogger } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api/IApi';

import { settings } from './settings';
import { WhosOutEndpoint } from './endpoints/WhosOut';

export class BamboohrApp extends App {
    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        // await configuration.slashCommands.provideSlashCommand(new JitsiSlashCommand(this));
        await configuration.api.provideApi({
            visibility: ApiVisibility.PRIVATE,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new WhosOutEndpoint(this),
            ],
        });

        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
    }
}
