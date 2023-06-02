import { RouteType } from '@app/enums/attributes';

export interface Route {
    id: string,
    destination: string,
    type: RouteType,
    color: string,
    nightOnly: boolean,
    accessible: boolean,
}