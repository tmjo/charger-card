/** TEMPLATE - replace with your brand name */

import type { template } from '../types';
import {TEMPLATE_EDITOR as edt} from '../const';


export const data:template = {
    config: {
        'domain': 'zaptec',
        'name': 'Zaptec',
        'domainbase': '_charger',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: true,        
    },
    details:{
        // DETAILS ITEMS (APPLY THE ONES YOU NEED)
            // name                             // An object with entity item (or only text-attribute if plain text is wanted)
            // location                         // An object with entity item (or only text-attribute if plain text is wanted)
            // status                           // A plain text or an entity item
            // substatus                        // A plain text or an entity item
            // smartcharging                    // An entity item (bool) defining smart charging (used for blue leds)
            // currentlimits                    // A list of allowed values for current limits, for instance used in dropdowns
            // statetext                        // Mapping states to custom statetexts, for instance {charging: 'Charging fine'} and so on
            // collapsiblebuttons               // Replaces default text and icon for collapsible buttons, for instance group1: { text: 'click_for_group1', icon: 'mdi:speedometer' }
            // info_left                        // A list of entity items used on top left of the card
            // info_right                       // A list of entity items used on top right of the card
            // group1                           // A list of entity items used on on the collapsible group1 (limits)
            // group2                           // A list of entity items used on on the collapsible group2 (info)
            // group3                           // A list of entity items used on on the collapsible group3 (config)
            // stats                            // Mapping of states where each state has a list of entity items which will appear for corresponding state above toolbar (datatable/stats)
            // toolbar_left                     // Mapping of states where each state has a list of entity items which will appear for corresponding state at left side of toolbar at bottom of card
            // toolbar_right                    // Mapping of states where each state has a list of entity items which will appear for corresponding state at right side of toolbar at bottom of card

        // ENTITY ITEMS (APPLY THE ONES YOU NEED)
            //     entity_id: '',                  // entity id
            //     attribute: '',                  // attribute is used as value if specified
            //     unit: '',                       // unit if you want to override entity unit
            //     unit_show: true,                // show unit next to value
            //     unit_showontext: true,          // show unit next to value in tooltip text
            //     text: '',                       // text to be used instead of entity friendly-name (do not use dots '.' and apply translation key to achieve translation)
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

        // SPECIAL TOKENS
            // edt.ENTITYPREFIX                    // This will be replaced with what is found from main sensor entity after removing MAIN_ENTITY_BASE
            // edt.SERVICEID_ENTITY                // A replacement used in the service call, typically for a chargerid or something that must be part of the data when calling service of a specific charger.
            // #SERVICEVAL#                        // A replacement used in the service call, typically for the value from a dropdown or similar. Use this in the template where for instance a current limit is supposed to be sent to a charger.


        //NAME, LOCATION, STATUS ETC
        name: {
            entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_charger',
            attribute: 'name',
        },
        location: {
            entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_charger',
            attribute: 'installation_name',
        },
        status: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charger_mode',
        },
        substatus: {
            entity_id: 'switch.' +edt.ENTITYPREFIX +'._charging',
        },
        smartcharging: {
            //controls white or blue leds
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charger_mode',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [0, 6, 10, 16, 20, 25, 32],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
            disconnected: 'Disconnected',
            awaiting_start: 'Waiting',
            charging: 'Charging',
            completed: 'Charge done',
            error: 'Unknown',
            ready_to_charge: 'Disconnected',
        },

        // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
        collapsiblebuttons: {
                group1: { text: 'click_for_group1', icon: 'mdi:speedometer' },
                group2: { text: 'click_for_group2', icon: 'mdi:information' },
                group3: { text: 'click_for_group3', icon: 'mdi:cog' },
            },

        //ICONS LEFT AND RIGHT
        info_left: [
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_permanent_cable_lock',
                text: 'cable lock',
            }
        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_voltage_phase_1',
                text: 'voltage',
                unit_show: true,
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charge_power',
                text: 'power',
                unit_show: true,
            }
        ],

        //LIMITS
        group1: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_charger_limit',
                text: 'dyn_charger_limit',
                service: 'easee.set_charger_dynamic_limit',
                service_data: {charger_id: edt.SERVICEID_ENTITY, current: '#SERVICEVAL#'},
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                text: 'dyn_circuit_limit',
                service: 'easee.set_charger_circuit_dynamic_limit',
                service_data: {charger_id: edt.SERVICEID_ENTITY, currentP1: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                text: 'max_charger_limit',
                service: 'easee.set_charger_max_limit',
                service_data: {charger_id: edt.SERVICEID_ENTITY, current: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                text: 'max_circuit_limit',
                service: 'easee.set_circuit_max_limit',
                service_data: {charger_id: edt.SERVICEID_ENTITY, currentP1: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                text: 'offline_circuit_limit',
                service: 'easee.set_charger_circuit_offline_limit',
                service_data: {charger_id: edt.SERVICEID_ENTITY, currentP1: '#SERVICEVAL#'},
            },
        ],

        //INFO
        group2: [
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_online',
                text: 'online',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_voltage',
                text: 'voltage',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_power',
                text: 'power',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current',
                text: 'charger_current',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_circuit_current',
                text: 'circuit_current',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_per_hour',
                text: 'energy_per_hour',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                text: 'session_energy',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_lifetime_energy',
                text: 'lifetime_energy',
                unit_show: true,
            },
        ],

        //CONFIG
        group3: [
            {
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_is_enabled',
                text: 'enabled',
            },
            {
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_enable_idle_current',
                text: 'idle_current',
            },
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_cable_locked',
                text: 'cable_locked',
            },
            {
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_cable_locked_permanently',
                text: 'perm_cable_locked',
            },
            {
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_smart_charging',
                text: 'smart_charging',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_cost_per_kwh',
                text: 'cost_per_kwh',
            },
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
                text: 'update_available',
            },
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                text: 'schedule',
            }
        ],

        //STATS - based on state of main entity, default if state not found
        stats: {

            default: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_completed_session_energy',
                    text: 'Session energy',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_permanent_cable_lock',
                    text: 'Cable locked',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_meter',
                    text: 'Energy meter',
                }
            ],

            disconnected: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'switch.' +edt.ENTITYPREFIX +'_cable_locked_permanently',
                    text: 'cable_locked',
                },
                {
                    entity_id: 'calculated',
                    text: 'used_limit',
                    unit: 'A',
                    unit_show: true,
                    calc_function: 'min',
                    calc_entities: [
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                        },
                    ]
                }
            ],

            awaiting_start: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                },
                {
                    entity_id: 'switch.' +edt.ENTITYPREFIX +'_smart_charging',
                    text: 'smart_charging',
                },
                {
                    entity_id: 'calculated',
                    text: 'used_limit',
                    unit: 'A',
                    unit_show: true,
                    calc_function: 'min',
                    calc_entities: [
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                        },
                    ]
                }
            ],

            charging: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_per_hour',
                    text: 'energy_per_hour',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_circuit_current',
                    text: 'circuit_current',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_output_limit',
                    text: 'output_limit',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current',
                    text: 'current',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_power',
                    text: 'power',
                    unit_show: true,
                }
            ],

            completed: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                },
                {
                    entity_id: 'calculated',
                    text: 'used_limit',
                    unit: 'A',
                    unit_show: true,
                    calc_function: 'min',
                    calc_entities: [
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                        },
                    ]
                }
            ],

            error: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                }
            ],
            ready_to_charge: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                },
                {
                    entity_id: 'calculated',
                    text: 'used_limit',
                    unit: 'A',
                    unit_show: true,
                    calc_function: 'min',
                    calc_entities: [
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                        },
                    ]
                }
            ],
        },

        // TOOLBAR
        toolbar_left: {
            default: [
                // {},
                ],

            disconnected: [
                // {},
            ],

            awaiting_start: [
                {
                    service: 'easee.stop',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.resume',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'resume',
                    icon: 'hass:play',
                },
                {
                    service: 'easee.override_schedule',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'override',
                    icon: 'hass:motion-play',
                },

            ],

            charging: [
                {
                    service: 'easee.stop',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.pause',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'pause',
                    icon: 'hass:pause',
                },
            ],

            completed: [
                {
                    service: 'easee.stop',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.override_schedule',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'override',
                    icon: 'hass:motion-play',
                },
            ],

            error: [
                {
                    service: 'easee.reboot',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'reboot',
                    icon: 'hass:restart',
                },
            ],
            ready_to_charge: [
                {
                    service: 'easee.stop',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.override_schedule',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'override',
                    icon: 'hass:motion-play',
                },
            ],
        },
        toolbar_right: {
            default: [
                {
                    service: 'persistent_notification.create',
                    service_data: {message: 'Firmware update is available, but only possible when disconnected!', title: 'Update'},
                    text: 'update',
                    icon: 'mdi:file-download',
                    conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_firmware.latest_version',
                },
                ],

            disconnected: [
                {
                    service: 'easee.update_firmware',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'update',
                    icon: 'mdi:file-download',
                    conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
                },
            ],
        },

    }

}

