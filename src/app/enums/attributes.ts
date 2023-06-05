export enum RouteType {
    Tram,
    Subway,
    Rail,
    Bus,
    Ferry,
    CableTram,
    AerialLift,
    Funicular,
    Trolleybus = 11,
    Monorail = 12,
}

export enum PickupType {
    RegularlyScheduledPickup,
    NoPickupAvailable,
    MustPhoneAgencyToArrangePickup,
    MustCoordinateWithDriverToArrangePickup,
}

export enum DropOffType {
    RegularlyScheduledDropOff,
    NoDropOffAvailable,
    MustPhoneAgencToArrangeDropOff,
    MustCoordinateWithDriverToArrangeDropOff,
}
