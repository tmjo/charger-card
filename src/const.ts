export const VERSION = '0.2.6';

//Replacement tags for card editor and templates
export const TEMPLATE_EDITOR = {
  ENTITYPREFIX : '#ENTITYPREFIX#',
  SERVICEID : '#SERVICEID#',
  SERVICEID_DEVICE : '#SERVICEID_DEVICE_ID#',
  SERVICEID_ENTITY : '#SERVICEID_MAIN_ENTITY#',
  SERVICEID_STATE : '#SERVICEID_MAIN_STATE#',
  SERVICEID_ATTR : '#SERVICEID_MAIN_ATTR#',
  SERVICEVAL : '#SERVICEVAL#', 
}

// TODO: Find a way to read device_class icons instead of this
export const DEVICECLASS_ICONS = {
  voltage : 'mdi:sine-wave',
  lock: 'mdi:lock',
  connectivity: 'mdi:wifi',
  current: 'mdi:sine-wave',
  energy: 'mdi:flash',
  power: 'mdi:flash',
  plug: 'mdi:power-plug',
  monetary: 'mdi:cash',
};

export const DEFAULT_ICON = 'mdi:crosshairs-question';

import imageGeneric from './img/charger_generic_223x302.png';
import imageAnthracite from './img/charger_anthracite_223x302.png';
import imageRed from './img/charger_red_223x302.png';
import imageBlack from './img/charger_black_223x302.png';
import imageWhite from './img/charger_white_223x302.png';
import imageDarkblue from './img/charger_darkblue_223x302.png';
export const DEFAULT_IMAGE = 'Generic';
export const CHARGER_IMAGES = {
  'Generic': imageGeneric,
  'Anthracite': imageAnthracite,
  'Red': imageRed,
  'Black': imageBlack,
  'White': imageWhite,
  'Darkblue': imageDarkblue,
};

export const DEFAULT_CURRENTLIMITS = [8.0, 10.0, 16.0, 20.0, 25.0, 32.0];
export const DEFAULT_CUSTOMCARDTHEME = 'theme_default';
export const CARD_THEMES = [
  { name: 'theme_default', desc: 'Default HA colors' },
  { name: 'theme_custom', desc: 'Use custom theme' },
  { name: 'theme_transp_blue', desc: 'Transparent Blue' },
  { name: 'theme_transp_black', desc: 'Transparent Black' },
  { name: 'theme_transp_white', desc: 'Transparent White' },
  { name: 'theme_lightgrey_blue', desc: 'LightGrey Blue' },
];


import ledOff from './img/charger_leds_bg.gif';
import ledWhite2 from './img/charger_leds_white_2.gif';
import ledWhiteAll from './img/charger_leds_white_all.gif';
import ledWhiteFlashing from './img/charger_leds_white_flashing.gif';
import ledBlue2 from './img/charger_leds_blue_2.gif';
import ledBlueAll from './img/charger_leds_blue_all.gif';
import ledBlueFlashing from './img/charger_leds_blue_flashing.gif';
import ledRedFlashing from './img/charger_leds_red_flashing.gif';

export const LEDIMAGES = {
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

  export const DEFAULT_PRECISION = 1;
