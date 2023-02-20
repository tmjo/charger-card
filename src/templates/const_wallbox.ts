/** WALLBOX CHARGER */

import { TEMPLATE_EDITOR } from '../const';
import type { template } from './../types';
import {TEMPLATE_EDITOR as edt} from './../const';

export const data:template = {
    config: {
        'domain': 'wallbox',
        'name': 'Wallbox charger',
        'domainbase': '_status_description',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: false,        
    },
    details:{
        //NAME, LOCATION, STATUS ETC
        name: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status_description',
            attribute: 'name',
        },
        status: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status_description',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [0, 6, 10, 16, 20, 25, 32, 40],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
            Unplugged: 'Unplugged',
            Scheduled: 'Scheduled',
            Charging: 'Charging',
            'Waiting for car demand': 'Waiting for car demand',
            error: 'error',
            Ready: 'Ready',
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
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_pause_resume',
                text: 'Pause/resume',
            }
        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_depot_price',
                text: 'Price per kWh',
                unit_show: true,
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charging_current',
                text: 'Power (Amps)',
                unit_show: true,
            }
        ],

        //LIMITS
        group1: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_power',
                text: 'dyn_charger_limit',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charging_current',
                text: 'dyn_circuit_limit',
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charger_limit',
                text: 'max_charger_limit',
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_available_power',
                text: 'max_circuit_limit',
            },
        ],

        //INFO
        group2: [

            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_power',
                text: 'power',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_speed',
                text: 'charger_current',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charging_current',
                text: 'circuit_current',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_discharged_energy',
                text: 'session_energy',
                unit_show: true,
            },
        ],

        //CONFIG
        group3: [
            {
                entity_id: 'lock.' +edt.ENTITYPREFIX +'_locked_unlocked',
                text: 'enabled',
            },
        ],

        //STATS - based on state of main entity, default if state not found
        stats: {

            default: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_power',
                    text: 'Charging power',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_added_range',
                    text: 'Added range',
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                }
            ],

            disconnected: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_available_power',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'lock.' +edt.ENTITYPREFIX +'_locked_unlocked',
                    text: 'cable_locked',
                },
            ],


            Charging: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_charging_current',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_power',
                    text: 'energy_per_hour',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_added_range',
                    text: 'circuit_current',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_added_energy',
                    text: 'output_limit',
                    unit_show: true,
                },
            ],

            'Waiting for car demand': [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_added_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
            ],

            error: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_added_energy',
                    text: 'session_energy',
                    unit_show: true,
                },
            ],
            Scheduled: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status_description',
                    text: 'Charger status',
                    unit_show: true,
                },
                {
                    entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
                    text: 'schedule',
                },
                {
                    entity_id: 'calculated',
                    text: 'Charging Power',
                    unit: 'A',
                    unit_show: true,
                    calc_function: 'min',
                    calc_entities: [
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_available_power',
                        },
                        {
                            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_current',
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
                // {},            
            ],

            charging: [
                // {},            
            ],

            completed: [
                // {},            
            ],

            error: [
                // {},
            ],
            ready_to_charge: [
                // {},
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

