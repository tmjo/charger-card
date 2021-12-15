export const VERSION = '0.0.14';

export const CARDCONFIGTYPES = {
  easee: "Easee",
  test: "Test",
  other: "Other",
};

// TODO: Find a way to read device_class icons instead of this
export const DEVICECLASS_ICONS = {
  voltage : 'mdi:sine-wave',
  lock: 'mdi:lock',
  connectivity: 'mdi:wifi',
  current: 'mdi:sine-wave',
  energy: 'mdi:flash',
  power: 'mdi:flash',
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

