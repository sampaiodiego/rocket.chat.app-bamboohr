import { IHttp, ILogger } from "@rocket.chat/apps-engine/definition/accessors";

import { formatDate } from './utils';

interface WhosOutParams {
    today: Date;
    http: IHttp;
    bambooSubdomain: String;
    bambooToken: String;
    logger: ILogger;
}

function getItem(item, tag) {
    const result = new RegExp(`<${ tag }[^>]+>(.*)<\\/${ tag }>`).exec(item);
    const start = /<start>(.*)<\/start>/.exec(item);
    const end = /<end>(.*)<\/end>/.exec(item);

    if (!result) {
        return;
    }
    if (!start) {
        return;
    }
    if (!end) {
        return;
    }

    return { result: result[1], start: start[1], end: end[1] };
}

function getItems(content, type, tag) {
    const regex = new RegExp(`<item type="${ type }"[^\\0]*?<\\/item>`, 'mg');
    const items:any = [];
    let item;
    while ((item = regex.exec(content)) !== null) {
        items.push(getItem(item[0], tag));
    }
    return items;
}

export async function getWhosOut({ today, http, bambooSubdomain, bambooToken, logger }: WhosOutParams): Promise<{ whosout: Array<string>, holidaysToday: Array<string>, holidaysTomorrow: Array<string> }> {
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayString = formatDate(today);
    const tomorrowString = formatDate(tomorrow);

    const url = `https://api.bamboohr.com/api/gateway.php/${ bambooSubdomain }/v1/time_off/whos_out/?start=${ todayString }&end=${ tomorrowString }`;

    const options = {
        auth: `${ bambooToken }:x`,
    };
    const result = await http.get(url, options);

    const content = <string>result.content;

    const whosout:string[] = getItems(content, 'timeOff', 'employee')
        .filter((timeoff) => timeoff.start <= todayString)
        .map((timeoff) => timeoff.result);
    const holidaysToday:string[] = getItems(content, 'holiday', 'holiday')
        .filter((holiday) => holiday.start <= todayString)
        .map((timeoff) => timeoff.result);
    const holidaysTomorrow:string[] = getItems(content, 'holiday', 'holiday')
        .filter((holiday) => holiday.end >= tomorrowString)
        .map((timeoff) => timeoff.result);

    return {
        whosout,
        holidaysToday,
        holidaysTomorrow,
    };
}
