export const DOMAIN = 'easee';
export const MAIN_ENTITY_BASE = '_status';

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

export const SERVICES = {
    chargerMaxCurrent: 'set_charger_max_limit',
    chargerDynCurrent: 'set_charger_dynamic_limit',
    circuitMaxCurrent: 'set_charger_circuit_max_limit',
    circuitDynCurrent: 'set_charger_circuit_dynamic_limit',
    circuitOfflineCurrent: 'set_charger_circuit_offline_limit'
};

export const STATUS = {
    'disconnected' : "disconnected",
    'awaiting_start': 'awaiting_start',
    'charging': 'charging',
    'completed': 'completed',
    'error': 'error',
    'error': 'ready_to_charge'
  };

export const DEFAULT_CONFIG = {
    // TEMPLATE

    // template: [{
    //     entity_id: '',                  // entity id
    //     attribute: '',                  // attribute is used as value if specified
    //     unit: '',                       // unit if you want to override entity unit
    //     unit_show: true,                // show unit next to value
    //     unit_showontext: true,          // show unit next to value in tooltip text
    //     text: '',                       // text to be used instead of entity friendly-name
    //     service: '',                    // service on format 'domain.service'
    //     service_data: ['test','test'],  // service data for the service call
    //     icon: '',                       // icon to be used instead of entity icon
    //     round: 0,                       // round to specified number of decimals (integer)
    //     type: '',                       // type
    //   }],

    //NAME, LOCATION, STATUS ETC
    name: {
        entity_id: 'sensor.easee_1_status',
        attribute: 'name',
    },
    location: {
        entity_id: 'sensor.easee_1_status',
        attribute: 'site_name',
    },
    status: {
        entity_id: 'sensor.easee_1_status',
    },
    substatus: {
        entity_id: 'sensor.easee_1_reason_for_no_current',
    },
    smartcharging: {
        entity_id: 'switch.easee_1_smart_charging',
    },

    //ICONS LEFT AND RIGHT
    info_left: [
        {
        entity_id: 'binary_sensor.easee_1_online',
        text: 'Online'
        }
    ],
    info_right: [
        {
        entity_id: 'sensor.easee_1_voltage',
        text: 'Voltage'
        },{
        entity_id: 'sensor.easee_1_power',
        text: 'Power'
        }
    ],

    //LIMITS
    group1: [
        {
        entity_id: 'sensor.easee_1_dynamic_charger_limit',
        text: 'Dyn. charger limit'
        },{
        entity_id: 'sensor.easee_1_dynamic_circuit_limit',
        text: 'Dyn. circuit limit'
        },{
        entity_id: 'sensor.easee_1_max_charger_limit',
        text: 'Charger limit'
        },{
        entity_id: 'sensor.easee_1_max_circuit_limit',
        text: 'Circuit limit'
        },{
        entity_id: 'sensor.easee_1_offline_circuit_limit',
        text: 'Offline circuit limit'
        },{
        entity_id: 'sensor.easee_1_output_limit',
        text: 'Output limit'
        }
    ],

    //INFO
    group2: [
        {
        entity_id: 'binary_sensor.easee_1_online',
        text: 'Online'
        },{
        entity_id: 'sensor.easee_1_voltage',
        text: 'Voltage'
        },{
        entity_id: 'sensor.easee_1_power',
        text: 'Power'
        },{
        entity_id: 'sensor.easee_1_current',
        text: 'Current'
        },{
        entity_id: 'sensor.easee_1_circuit_current',
        text: 'Circuit Current'
        },{
        entity_id: 'sensor.easee_1_energy_per_hour',
        text: 'Energy per hour'
        },{
        entity_id: 'sensor.easee_1_lifetime_energy',
        text: 'Total energy'
        },{
        entity_id: 'sensor.easee_1_session_energy',
        text: 'Total energy'
        }
    ],

    //CONFIG
    group3: [
        {
        entity_id: 'switch.easee_1_is_enabled',
        text: 'Enabled'
        },{
        entity_id: 'switch.easee_1_enable_idle_current',
        text: 'Idle Current'
        },{
        entity_id: 'binary_sensor.easee_1_cable_locked',
        text: 'Cable locked'
        },{
        entity_id: 'switch.easee_1_cable_locked_permanently',
        text: 'Perm. locked'
        },{
        entity_id: 'switch.easee_1_smart_charging',
        text: 'Smart charging'
        },{
        entity_id: 'sensor.easee_1_cost_per_kwh',
        text: 'Cost per kWh'
        },{
        entity_id: 'binary_sensor.easee_1_update_available',
        text: 'Update available'
        },{
        entity_id: 'binary_sensor.easee_1_basic_schedule',
        text: 'Schedule'
        }
    ],

    //STATS - based on state of main entity, default if state not found
    stats: {

        default: [
            {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }, {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }
        ],

        disconnected: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'switch.easee_1_cable_locked_permanently',
            text: 'CableLocked'
            },
            // {
            // entity_id: 'sensor.usedCurrentLimit',
            // text: 'Schedule'
            // }
        ],

        awaiting_start: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }, {
            entity_id: 'switch.easee_1_smart_charging',
            text: 'SmartCharging'
            },
            // {
            // entity_id: 'sensor.usedCurrentLimit',
            // text: 'Schedule'
            // }
        ],

        charging: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'sensor.easee_1_energy_per_hour',
            text: 'Rate'
            },{
            entity_id: 'sensor.easee_1_circuit_current',
            text: 'Circuit'
            }, {
            entity_id: 'sensor.easee_1_output_limit',
            text: 'Allowed'
            }, {
            entity_id: 'sensor.easee_1_current',
            text: 'Actual'
            }, {
            entity_id: 'sensor.easee_1_power',
            text: 'Power'
            }
        ],

        completed: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }
        ],

        error: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }
        ],
        ready_to_charge: [
            {
            entity_id: 'sensor.easee_1_session_energy',
            text: 'Energy'
            }, {
            entity_id: 'binary_sensor.easee_1_basic_schedule',
            text: 'Schedule'
            }
        ],
    },

    // toolbar: [{

    // }],

    // OVERRIDE CURRENTLIMITS
    currentlimits: [10, 16, 20, 25, 32],

    // OVERRIDE STATE TEXT - also overrides translation
    statetext: {
        disconnected: 'Disconnected',
        awaiting_start: 'Paused or awaiting start',
        charging: 'Charging',
        completed: 'Completed or awaiting car',
        error: 'Error',
        ready_to_charge: 'Ready to charge',
    },

    // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
    collapsiblebuttons: {
        group1: {text: 'Click for limits', icon: 'mdi:speedometer'},
        group2: {text: 'Click for info', icon: 'mdi:information'},
        group3: {text: 'Click for config', icon: 'mdi:cog'},
    }
};

