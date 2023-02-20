import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
declare global {
  interface HTMLElementTagNameMap {
    'charger-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}
export interface ChargerCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  details?: cardDetails;
}
export interface cardEntity{
  entity_id?: string;
  attribute?: string;
  text?: string;
  unit_show?: boolean;
  [propName: string]: any;
}
export interface cardServiceEntity{
  service: string;
  service_data: {[index: string]: any};
  // service_data: [key: string]:any;
  text: string;
  icon: string;
  conditional_entity?:string;
  attr?:string|number;
  [propName: string]: any;
}
// CARD TEMPLATE DETAILS
export interface cardDetails{
  //NAME, LOCATION, STATUS ETC
  name?: cardEntity;
  location?: cardEntity;
  status?: cardEntity;
  substatus?: cardEntity;
  smartcharging?: cardEntity;
  // OVERRIDE CURRENTLIMITS
  currentlimits?: number[];
  // OVERRIDE STATE TEXT - also overrides translation
  statetext?: {[index: string|number]: string};
  // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
  collapsiblebuttons?: {group1:{text: string; icon: string;}; group2:{text: string; icon: string;}; group3:{text: string; icon: string;}};
  //ICONS LEFT AND RIGHT
  info_left?: cardEntity[];
  info_right?: cardEntity[];
  //GROUPS
  group1?: cardEntity[];  //LIMITS
  group2?: cardEntity[];  //INFO
  group3?: cardEntity[];  //CONFIG
  //STATS - based on state of main entity, default if state not found
  stats?: {[index: string|number]: cardEntity[]};
  // TOOLBAR
  toolbar_left?: {[index: string|number]: cardServiceEntity[]};
  toolbar_right?: {[index: string|number]: cardServiceEntity[]};
  [propName: string]: any;
}

  // Basic card config
export interface cardConfig{
  type?: string;
  entity?: string;
  customCardtheme?:string;
  chargerImage?:string;
  brand?:string;
  show_leds?: boolean;
  details?: cardDetails;
  [propName: string]: any;
}

// Template config
export interface templateConfig{
  
  domain:string;
  name:string;
  domainbase: string;
  serviceid: string;
  serviceid_data: object;
}

// Template data
export interface template{
  config:templateConfig;
  defaults:cardConfig;
  details:cardDetails;
}
