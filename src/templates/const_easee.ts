/** EASEE CHARGING ROBOT */
import { TEMPLATE_EDITOR } from '../const';
import type { template } from './../types';
import {TEMPLATE_EDITOR as edt} from './../const';

export const data:template = {
    config: {
        'domain': 'easee',
        'name': 'Easee charger',
        'domainbase': '_status',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: true,        
    },
    details:{
        //NAME, LOCATION, STATUS ETC
        name: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status',
            attribute: 'name',
        },
        location: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status',
            attribute: 'site_name',
        },
        status: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status',
        },
        substatus: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_reason_for_no_current',
        },
        smartcharging: {
            //controls white or blue leds
            entity_id: 'switch.' +edt.ENTITYPREFIX +'_smart_charging',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [0, 6, 10, 16, 20, 25, 32],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
            disconnected: 'disconnected',
            awaiting_start: 'awaiting_start',
            charging: 'charging',
            completed: 'completed',
            error: 'error',
            ready_to_charge: 'ready_to_charge',
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
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_online',
                text: 'online',
            }
        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_voltage',
                text: 'voltage',
                unit_show: true,
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_power',
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
                service_data: {device_id: edt.SERVICEID_DEVICE, current: '#SERVICEVAL#'},
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_dynamic_circuit_limit',
                text: 'dyn_circuit_limit',
                service: 'easee.set_circuit_dynamic_limit',
                service_data: {device_id: edt.SERVICEID_DEVICE, currentP1: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                text: 'max_charger_limit',
                service: 'easee.set_charger_max_limit',
                service_data: {device_id: edt.SERVICEID_DEVICE, current: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_circuit_limit',
                text: 'max_circuit_limit',
                service: 'easee.set_circuit_max_limit',
                service_data: {device_id: edt.SERVICEID_DEVICE, currentP1: '#SERVICEVAL#'},
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_offline_circuit_limit',
                text: 'offline_circuit_limit',
                service: 'easee.set_circuit_offline_limit',
                service_data: {device_id: edt.SERVICEID_DEVICE, currentP1: '#SERVICEVAL#'},
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
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'switch.' +edt.ENTITYPREFIX +'_cable_locked_permanently',
                    text: 'cable_locked',
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
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
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'stop'},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'resume'},
                    text: 'resume',
                    icon: 'hass:play',
                },
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'override_schedule'},
                    text: 'override',
                    icon: 'hass:motion-play',
                },

            ],

            charging: [
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'stop'},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'pause'},
                    text: 'pause',
                    icon: 'hass:pause',
                },
            ],

            completed: [
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'stop'},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'override_schedule'},
                    text: 'override',
                    icon: 'hass:motion-play',
                },
            ],

            error: [
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'reboot'},
                    text: 'reboot',
                    icon: 'hass:restart',
                },
            ],
            ready_to_charge: [
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'stop'},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'override_schedule'},
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
                    conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
                },
                ],

            disconnected: [
                {
                    service: 'easee.action_command',
                    service_data: {device_id: edt.SERVICEID_DEVICE, action_command: 'update_firmware'},
                    text: 'update',
                    icon: 'mdi:file-download',
                    conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
                },
            ],
        },

        }

}

