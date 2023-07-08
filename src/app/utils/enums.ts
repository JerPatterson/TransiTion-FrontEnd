export enum LocationType {
  StopOrPlatform,
  Station,
  EntranceOrExit,
  GenericNode,
  BoardingArea,
}

export enum WheelchairBoardingType {
  NoInformation,
  SomeVehicles,
  NotPossible,
}

export enum RouteType {
  LightRail,
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
  ContinuousStopping,
  NoContinuousStopping,
  MustPhoneTheAgency,
  MustCoordinateWithDriver,
}

export enum DropOffType {
  ContinuousStopping,
  NoContinuousStopping,
  MustPhoneTheAgency,
  MustCoordinateWithDriver,
}

export enum BikesBoardingType {
  NoInformation,
  SomeVehicles,
  NotPossible,
}

export enum TimePointType {
  Approximated,
  Exact,
}

export enum ServiceExceptionType {
  ServiceAddedForTheDate = 1,
  ServiceRemovedForTheDate = 2,
}

export enum Day {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}
