import type { template } from './types';
export * as cconst from './const';
import * as easee from './templates/const_easee';
import * as test from './templates/const_template';
import * as vwegolf from './templates/const_vwegolf';
import * as openevse from './templates/const_openevse';
import * as ocpp from './templates/const_ocpp';
import * as wallbox from './templates/const_wallbox';
import * as tesla_custom from './templates/const_tesla_custom';
import * as zaptec_custom from './templates/const_zaptec';

export const CARDTEMPLATES:template[] = [
  easee.data,
  test.data,
  vwegolf.data,
  openevse.data,
  ocpp.data,
  wallbox.data,
  tesla_custom.data,
  zaptec_custom.data,
];



