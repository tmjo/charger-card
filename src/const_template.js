// FOR NEW TEMPLATES
// Update const.js CARDCONFIGTYPES
// Update charger-card-editor.js setCardConfigType switch-statement

export const MAIN_ENTITY_BASE = '_status';
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
    //     service_data: {'test','test'},  // service data for the service call
    //     icon: '',                       // icon to be used instead of entity icon
    //     round: 0,                       // round to specified number of decimals (integer)
    //     type: '',                       // type
    //     calc_function: ''               // define entity_id as 'calculated' and specify min,max,mean,sum here to calculate
    //     calc_entities: ''               // entities to calculate from above feature
    //     conditional_entity: ''          // if you want the entity_id to be shown conditionally, specify a on/off or true/false sensor here
    //     conditional_attribute: ''       // if you prefer the conditional showing of entity to be based on an attribute, define it here
    //     conditional_invert: ''          // if you prefer to invert the conditional showing of an entity to show when false, invert by true
    //   }],

    //NAME, LOCATION, STATUS ETC
    name: {
        entity_id: 'sensor.CHARGERNAME_status',
        attribute: 'name',
    },
    location: {
        entity_id: 'sensor.CHARGERNAME_status',
        attribute: 'site_name',
    },
    status: {
        entity_id: 'sensor.CHARGERNAME_status',
    },
    substatus: {
        entity_id: 'sensor.CHARGERNAME_reason_for_no_current',
    },
    smartcharging: {
        entity_id: 'switch.CHARGERNAME_smart_charging',
    },

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
    collapsiblebuttons: [
        {
            group1: { text: 'Click for limits', icon: 'mdi:speedometer' }
        },
        {
            group2: { text: 'Click for info', icon: 'mdi:information' }
        },
        {
            group3: { text: 'Click for config', icon: 'mdi:cog' }
        },
    ],

    //ICONS LEFT AND RIGHT
    info_left: [
        {
        entity_id: 'binary_sensor.CHARGERNAME_online',
        text: 'Online'
        }
    ],
    info_right: [
        {
        entity_id: 'sensor.CHARGERNAME_voltage',
        text: 'Voltage'
        },{
        entity_id: 'sensor.CHARGERNAME_power',
        text: 'Power'
        }
    ],

    //LIMITS
    group1: [
        {
            entity_id: 'sensor.CHARGERNAME_dynamic_charger_limit',
            text: 'Dyn. charger limit'
        },
        {
            entity_id: 'sensor.CHARGERNAME_dynamic_circuit_limit',
            text: 'Dyn. circuit limit'
        },{
            entity_id: 'sensor.CHARGERNAME_max_charger_limit',
            text: 'Charger limit'
        },{
            entity_id: 'sensor.CHARGERNAME_max_circuit_limit',
            text: 'Circuit limit'
        },{
            entity_id: 'sensor.CHARGERNAME_offline_circuit_limit',
            text: 'Offline circuit limit'
        },{
            entity_id: 'sensor.CHARGERNAME_output_limit',
            text: 'Output limit'
        }
    ],

    //INFO
    group2: [
        {
            entity_id: 'binary_sensor.CHARGERNAME_online',
            text: 'Online'
        },
        {
            entity_id: 'sensor.CHARGERNAME_voltage',
            text: 'Voltage'
        },
        {
            entity_id: 'sensor.CHARGERNAME_power',
            text: 'Power'
        },
        {
            entity_id: 'sensor.CHARGERNAME_current',
            text: 'Current'
        },
        {
            entity_id: 'sensor.CHARGERNAME_circuit_current',
            text: 'Circuit Current'
        },
        {
            entity_id: 'sensor.CHARGERNAME_energy_per_hour',
            text: 'Energy per hour'
        },
        {
            entity_id: 'sensor.CHARGERNAME_lifetime_energy',
            text: 'Total energy'
        },
        {
            entity_id: 'sensor.CHARGERNAME_session_energy',
            text: 'Total energy'
        }
    ],

    //CONFIG
    group3: [
        {
            entity_id: 'switch.CHARGERNAME_is_enabled',
            text: 'Enabled'
        },
        {
            entity_id: 'switch.CHARGERNAME_enable_idle_current',
            text: 'Idle Current'
        },
        {
            entity_id: 'binary_sensor.CHARGERNAME_cable_locked',
            text: 'Cable locked'
        },
        {
            entity_id: 'switch.CHARGERNAME_cable_locked_permanently',
            text: 'Perm. locked'
        },
        {
            entity_id: 'switch.CHARGERNAME_smart_charging',
            text: 'Smart charging'
        },
        {
            entity_id: 'sensor.CHARGERNAME_cost_per_kwh',
            text: 'Cost per kWh'
        },
        {
            entity_id: 'binary_sensor.CHARGERNAME_update_available',
            text: 'Update available'
        },
        {
            entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
            text: 'Schedule'
        }
    ],

    //STATS - based on state of main entity, default if state not found
    stats: {

        default: [
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            },
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            }
        ],

        disconnected: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'switch.CHARGERNAME_cable_locked_permanently',
                text: 'CableLocked'
            },
            {
                entity_id: 'calculated',
                text: 'Used Limit',
                unit: 'A',
                calc_function: 'min',
                calc_entities: [
                    {
                        entity_id: 'sensor.CHARGERNAME_dynamic_charger_limit',
                        // attribute: '',
                    },
                    {
                        entity_id: 'sensor.CHARGERNAME_dynamic_circuit_limit',
                        // attribute: '',
                    },
                    {
                        entity_id: 'sensor.CHARGERNAME_max_charger_limit',
                        // attribute: '',
                    },
                    {
                        entity_id: 'sensor.CHARGERNAME_max_circuit_limit',
                        // attribute: '',
                    },
                    {
                        entity_id: 'sensor.CHARGERNAME_offline_circuit_limit',
                        // attribute: '',
                    },
                ]
            }
        ],

        awaiting_start: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            },
            {
                entity_id: 'switch.CHARGERNAME_smart_charging',
                text: 'SmartCharging'
            },
            // {
            // entity_id: 'sensor.usedCurrentLimit',
            // text: 'Schedule'
            // }
        ],

        charging: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'sensor.CHARGERNAME_energy_per_hour',
                text: 'Rate'
            },
            {
                entity_id: 'sensor.CHARGERNAME_circuit_current',
                text: 'Circuit'
            },
            {
                entity_id: 'sensor.CHARGERNAME_output_limit',
                text: 'Allowed'
            },
            {
                entity_id: 'sensor.CHARGERNAME_current',
                text: 'Actual'
            },
            {
                entity_id: 'sensor.CHARGERNAME_power',
                text: 'Power'
            }
        ],

        completed: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            }
        ],

        error: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            }
        ],
        ready_to_charge: [
            {
                entity_id: 'sensor.CHARGERNAME_session_energy',
                text: 'Energy'
            },
            {
                entity_id: 'binary_sensor.CHARGERNAME_basic_schedule',
                text: 'Schedule'
            }
        ],
    },

    // TOOLBAR
    toolbar_left: {
        default: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:play-pause',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:motion-play',
                },
            ],

        disconnected: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'mdi:cancel',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'mdi:cancel',
            },
        ],

        awaiting_start: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:play-pause',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:motion-play',
            },
        ],

        charging: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:pause',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:stop',
            },
        ],

        completed: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:stop',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:motion-play',
            },
        ],

        error: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:restart',
            },
        ],
        ready_to_charge: [
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:stop',
            },
            {
                service: 'persistent_notification.create',
                service_data: {message: 'test1', title: 'test'},
                text: 'Schedule',
                icon: 'hass:motion-play',
            },
        ],
    },

};

