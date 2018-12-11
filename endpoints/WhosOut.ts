import { IHttp, IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { ApiEndpoint } from '@rocket.chat/apps-engine/definition/api/ApiEndpoint';
import { IApiEndpointInfo } from '@rocket.chat/apps-engine/definition/api/IApiEndpointInfo';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
// import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { getWhosOut } from '../BambooHR';
import { AppSetting } from '../settings';

import { IMessageAttachmentField } from '@rocket.chat/apps-engine/definition/messages/IMessageAttachmentField';
import { formatDate } from '../utils';

export class WhosOutEndpoint extends ApiEndpoint {
    public path: string = 'whosout';

    public async post(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp): Promise<IApiResponse> {
        this.app.getLogger().log(request);

        const settingsReader = read.getEnvironmentReader().getSettings();

        const bambooToken = await settingsReader.getValueById(AppSetting.Token);
        const bambooSubdomain = await settingsReader.getValueById(AppSetting.Subdoman);

        const sender = await read.getUserReader().getById('rocket.cat');
        const room = await read.getRoomReader().getById(await settingsReader.getValueById(AppSetting.Room)) as IRoom;

        const messageBuilder = await modify.getCreator().startMessage()
            .setSender(sender)
            .setRoom(room)
            .setUsernameAlias('Who\'s Out')
            .setEmojiAvatar(':date:');

        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { whosout, holidaysToday, holidaysTomorrow } = await getWhosOut({
            today,
            bambooToken,
            bambooSubdomain,
            http,
            logger: this.app.getLogger(),
        });

        const fields: Array<IMessageAttachmentField> = [];

        if (whosout.length > 0) {
            fields.push({
                title: `Out today (${ formatDate(today) }):`,
                value: whosout.join('\n'),
                short: true,
            });
        }

        if (holidaysToday.length > 0) {
            fields.push({
                title: `Holidays today (${ formatDate(today) }):`,
                value: holidaysToday.join('\n'),
                short: true,
            });
        }

        if (holidaysTomorrow.length > 0) {
            fields.push({
                title: `Holidays tomorrow (${ formatDate(tomorrow) }):`,
                value: holidaysTomorrow.join('\n'),
                short: true,
            });
        }

        if (fields.length === 0) {
            return this.success();
        }

        messageBuilder.addAttachment({ fields });

        modify.getCreator().finish(messageBuilder);

        return this.success();
    }
}
