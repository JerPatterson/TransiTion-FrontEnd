import { RouteType } from '@app/enums/attributes';

export interface Route {
    id: string,
    name: string,
    type: RouteType,
}