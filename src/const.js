export const VERSION = '0.0.14';

export const ENTITIES_CARD = [
  // "status",
  "cableLocked",
  "cableLockedPermanently",
  "basicSchedule",
  "circuitCurrent",
  "costPerKwh",
  "dynamicChargerCurrent",
  "dynamicCircuitCurrent",
  "enableIdleCurrent",
  "inCurrent",
  "isEnabled",
  "maxChargerCurrent",
  "maxCircuitCurrent",
  "offlineCircuitCurrent",
  "isOnline",
  "outputCurrent",
  "reasonForNoCurrent",
  "sessionEnergy",
  "energyPerHour",
  "energyLifetime",
  "smartCharging",
  "totalPower",
  "updateAvailable",
  "voltage",
];

export const EASEE_ENTITIES = {
  cableLocked: 'binary_sensor.cable_locked',
  cableLockedPermanently: 'switch.cable_locked_permanently',
  basicSchedule: 'binary_sensor.basic_schedule',
  circuitCurrent: 'sensor.circuit_current',
  costPerKwh: 'sensor.cost_per_kwh',
  dynamicChargerCurrent: 'sensor.dynamic_charger_limit',
  dynamicCircuitCurrent: 'sensor.dynamic_circuit_limit',
  enableIdleCurrent: 'switch.enable_idle_current',
  inCurrent: 'sensor.current',
  isEnabled: 'switch.is_enabled',
  maxChargerCurrent: 'sensor.max_charger_limit',
  maxCircuitCurrent: 'sensor.max_circuit_limit',
  offlineCircuitCurrent: 'sensor.offline_circuit_limit',
  isOnline: 'binary_sensor.online',
  outputCurrent: 'sensor.output_limit',
  reasonForNoCurrent: 'sensor.reason_for_no_current',
  sessionEnergy: 'sensor.session_energy',
  energyPerHour: 'sensor.energy_per_hour',
  energyLifetime: 'sensor.lifetime_energy',
  smartCharging: 'switch.smart_charging',
  totalPower: 'sensor.power',
  updateAvailable: 'binary_sensor.update_available',
  voltage: 'sensor.voltage',
};

export const EASEE_SERVICES = {
  chargerMaxCurrent: 'set_charger_max_limit',
  chargerDynCurrent: 'set_charger_dynamic_limit',
  circuitMaxCurrent: 'set_charger_circuit_max_limit',
  circuitDynCurrent: 'set_charger_circuit_dynamic_limit',
  circuitOfflineCurrent: 'set_charger_circuit_offline_limit',
};

export const EASEE_DOMAIN = 'easee';
export const EASEE_MAIN_ENTITY_BASE = '_status';

export const EASEE_CHARGERSTATUS = {
  STANDBY_1: 'disconnected',
  PAUSED_2: 'awaiting_start',
  CHARGING_3: 'charging',
  READY_4: 'completed',
  ERROR_5: 'error',
  CONNECTED_6: 'ready_to_charge',
};

export const EASEE_LEDIMAGES = {
  normal: {
    DEFAULT: ledOff,
    disconnected: ledWhite2,
    awaiting_start: ledWhiteAll,
    charging: ledWhiteFlashing,
    completed: ledWhiteAll,
    error: ledRedFlashing,
    ready_to_charge: ledWhiteAll,
  },
  smart: {
    DEFAULT: ledOff,
    disconnected: ledBlue2,
    awaiting_start: ledBlueAll,
    charging: ledBlueFlashing,
    completed: ledBlueAll,
    error: ledRedFlashing,
    ready_to_charge: ledBlueAll,
  },
};


import imageGeneric from './img/charger_generic_223x302.png';
import imageAnthracite from './img/charger_anthracite_223x302.png';
import imageRed from './img/charger_red_223x302.png';
import imageBlack from './img/charger_black_223x302.png';
import imageWhite from './img/charger_white_223x302.png';
import imageDarkblue from './img/charger_darkblue_223x302.png';

export const DEFAULTIMAGE = 'Generic';
export const CHARGER_IMAGES = [
  { name: 'Generic', img: imageGeneric },
  { name: 'Anthracite', img: imageAnthracite },
  { name: 'Red', img: imageRed },
  { name: 'Black', img: imageBlack },
  { name: 'White', img: imageWhite },
  { name: 'Darkblue', img: imageDarkblue },
];

import ledOff from './img/charger_leds_bg.gif';
import ledWhite2 from './img/charger_leds_white_2.gif';
import ledWhiteAll from './img/charger_leds_white_all.gif';
import ledWhiteFlashing from './img/charger_leds_white_flashing.gif';
import ledBlue2 from './img/charger_leds_blue_2.gif';
import ledBlueAll from './img/charger_leds_blue_all.gif';
import ledBlueFlashing from './img/charger_leds_blue_flashing.gif';
import ledRedFlashing from './img/charger_leds_red_flashing.gif';

export const ICONS = {
  "cableLocked":'mdi:lock',
  "cableLockedPermanently": 'mdi:lock',
  "basicSchedule": 'mdi:clock-check',
  "circuitCurrent": 'mdi:sine-wave',
  "costPerKwh": 'mdi:currency-usd',
  "dynamicChargerCurrent": 'mdi:sine-wave',
  "dynamicCircuitCurrent": 'mdi:sine-wave',
  "enableIdleCurrent": 'mdi:current-dc',
  "inCurrent": 'mdi:sine-wave',
  "isEnabled": 'mdi:power',
  "maxChargerCurrent": 'mdi:sine-wave',
  "maxCircuitCurrent": 'mdi:sine-wave',
  "offlineCircuitCurrent": 'mdi:sine-wave',
  "isOnline": 'mdi:wifi',
  "outputCurrent": 'mdi:sine-wave',
  "reasonForNoCurrent": 'mdi:alert-circle',
  "sessionEnergy": 'mdi:flash',
  "energyPerHour": 'mdi:flash',
  "energyLifetime": 'mdi:flash',
  "smartCharging": 'mdi:auto-fix',
  "totalPower": 'mdi:flash',
  "updateAvailable": 'mdi:file-download',
  "voltage": 'mdi:sine-wave',

};

export const CURRENTLIMITS = [8.0, 10.0, 16.0, 20.0, 25.0, 32.0];

export const DEFAULT_CUSTOMCARDTHEME = 'theme_default';
export const CUSTOM_CARD_THEMES = [
  { name: 'theme_default', desc: 'Default HA colors' },
  { name: 'theme_custom', desc: 'Use custom theme' },
  { name: 'theme_transp_blue', desc: 'Transparent Blue' },
  { name: 'theme_transp_black', desc: 'Transparent Black' },
  { name: 'theme_transp_white', desc: 'Transparent White' },
  { name: 'theme_lightgrey_blue', desc: 'LightGrey Blue' },
];

export const STATE_BUTTONS = [{ state: 'PAUSED', img: imageGeneric }];
