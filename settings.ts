import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    Token = 'token',
    Room = 'room',
    Subdoman = 'subdomain',
}

export const settings: Array<ISetting> = [
    {
            id: AppSetting.Token,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: true,
            i18nLabel: 'token',
            i18nDescription: 'token_description',
    },
    {
            id: AppSetting.Subdoman,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: true,
            i18nLabel: 'subdomain',
            i18nDescription: 'subdomain_description',
    },
    {
            id: AppSetting.Room,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: true,
            i18nLabel: 'room_id',
            i18nDescription: 'room_description',
    },
];
