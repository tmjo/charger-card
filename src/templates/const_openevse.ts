/** OpenEVSE */

import type { template } from './../types';
import {TEMPLATE_EDITOR as edt} from './../const';


export const data:template = {
    config: {
        'domain': 'openevse',
        'name': 'OpenEVSE',
        'domainbase': '_status',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: true,        
    },
    details:{
        //NAME, LOCATION, STATUS ETC
        name: {text: 'Charger'},
        location: {text: 'Home'},
        status: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_status',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [0, 6, 10, 16, 20, 25, 32],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
            disabled: 'Disconnected',
            active: 'Charging',
        },

        // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
        collapsiblebuttons: {
                group1: { text: 'click_for_group1', icon: 'mdi:speedometer' },
                group2: { text: 'click_for_group2', icon: 'mdi:information' },
                group3: { text: 'click_for_group3', icon: 'mdi:cog' },
            },

        //ICONS LEFT AND RIGHT
        info_left: [
            // {
            //     entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_voltage',
            //     text: 'voltage',
            //     unit_show: true,
            // },{
            //     entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_current',
            //     text: 'current',
            //     unit_show: true,
            // }
        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_voltage',
                text: 'Voltage',    //TODO: should be replaced with translation tag
                unit_show: true,
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_current',
                text: 'Current',    //TODO: should be replaced with translation tag
                unit_show: true,
            }
        ],

        //LIMITS
        group1: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_current',
                text: 'Max current',                //TODO: should be replaced with translation tag
                service: 'openevse.set_max_current',
                service_data: {charger_id: edt.SERVICEID_ENTITY, current: '#SERVICEVAL#'},
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_amps',
                text: 'Max amps',                   //TODO: should be replaced with translation tag
            },
        ],

        //INFO
        // group2: [
        //     {
        //         entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_online',
        //         text: 'online',
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_voltage',
        //         text: 'voltage',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_power',
        //         text: 'power',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current',
        //         text: 'charger_current',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_circuit_current',
        //         text: 'circuit_current',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_per_hour',
        //         text: 'energy_per_hour',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_session_energy',
        //         text: 'session_energy',
        //         unit_show: true,
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_lifetime_energy',
        //         text: 'lifetime_energy',
        //         unit_show: true,
        //     },
        // ],

        //CONFIG
        // group3: [
        //     {
        //         entity_id: 'switch.' +edt.ENTITYPREFIX +'_is_enabled',
        //         text: 'enabled',
        //     },
        //     {
        //         entity_id: 'switch.' +edt.ENTITYPREFIX +'_enable_idle_current',
        //         text: 'idle_current',
        //     },
        //     {
        //         entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_cable_locked',
        //         text: 'cable_locked',
        //     },
        //     {
        //         entity_id: 'switch.' +edt.ENTITYPREFIX +'_cable_locked_permanently',
        //         text: 'perm_cable_locked',
        //     },
        //     {
        //         entity_id: 'switch.' +edt.ENTITYPREFIX +'_smart_charging',
        //         text: 'smart_charging',
        //     },
        //     {
        //         entity_id: 'sensor.' +edt.ENTITYPREFIX +'_cost_per_kwh',
        //         text: 'cost_per_kwh',
        //     },
        //     {
        //         entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
        //         text: 'update_available',
        //     },
        //     {
        //         entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_basic_schedule',
        //         text: 'schedule',
        //     }
        // ],

        //STATS - based on state of main entity, default if state not found
        stats: {

            default: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_ambient_temperature',
                    text: 'Ambient temperature',    //TODO: should be replaced with translation tag
                    unit_show: true,
                },
            ],

            disabled: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_total_usage',
                    text: 'Total usage',    //TODO: should be replaced with translation tag
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current_power_usage',
                    text: 'Power',    //TODO: should be replaced with translation tag
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_max_amps',
                    text: 'Max amps',       //TODO: should be replaced with translation tag
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_usage_this_session',
                    text: 'Session energy',       //TODO: should be replaced with translation tag
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_ambient_temperature',
                    text: 'Temperature',       //TODO: should be replaced with translation tag
                },
            ],

            active: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current_power_usage',
                    text: 'Power',              //TODO: should be replaced with translation tag
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current_capacity',
                    text: 'Current',            //TODO: should be replaced with translation tag
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_usage_this_session',
                    text: 'Session energy',     //TODO: should be replaced with translation tag
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_ambient_temperature',
                    text: 'Temperature',       //TODO: should be replaced with translation tag
                },
            ],

        },

        // TOOLBAR
        toolbar_left: {
            disabled: [
                {
                    service: 'persistent_notification.create',      //TODO: remove test
                    service_data: {message: 'This is a test!', title: 'TEST'},
                    text: 'Test button',
                    icon: 'mdi:alert',
                },

                ],

            active: [   //TODO: need to know available service calls and what data needs to be sent
                {
                    service: 'openevse.stop',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'stop',
                    icon: 'hass:stop',
                },
                {
                    service: 'openevse.pause',
                    service_data: {charger_id: edt.SERVICEID_ENTITY},
                    text: 'pause',
                    icon: 'hass:pause',
                },
            ],

        },
        // toolbar_right: {
        //     default: [
        //         {
        //             service: 'persistent_notification.create',
        //             service_data: {message: 'Firmware update is available, but only possible when disconnected!', title: 'Update'},
        //             text: 'update',
        //             icon: 'mdi:file-download',
        //             conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
        //         },
        //         ],

        //     disconnected: [
        //         {
        //             service: 'easee.update_firmware',
        //             service_data: {charger_id: edt.SERVICEID_ENTITY},
        //             text: 'update',
        //             icon: 'mdi:file-download',
        //             conditional_entity: 'binary_sensor.' +edt.ENTITYPREFIX +'_update_available',
        //         },
        //     ],
        // },
        }

}

