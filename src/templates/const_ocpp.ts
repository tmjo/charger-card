/** EASEE CHARGING ROBOT */
import { TEMPLATE_EDITOR } from '../const';
import type { template } from './../types';
import {TEMPLATE_EDITOR as edt} from './../const';

export const data:template = {
    config: {
        'domain': 'ocpp',
        'name': 'OCPP charger',
        'domainbase': '_status_connector',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: true,        
    },
    details:{
        //NAME, LOCATION, STATUS ETC
        name: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_model',
            attribute: 'name',
        },
        status: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status_connector',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
            Available: 'Available',
            Preparing: 'Plugged in',
            SuspendedEV: 'Stopped (Car)',
            Charging: 'Charging',
            Finishing: 'Finishing',
        },

        // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
        collapsiblebuttons: {
                group1: { text: 'Details', icon: 'mdi:speedometer' },
                group2: { text: 'Information', icon: 'mdi:information' },
                group3: { text: 'Config', icon: 'mdi:cog' },
            },

        //ICONS LEFT AND RIGHT
        info_left: [
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_availability',
                text: 'Availability',
            },

        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_voltage',
                text: 'voltage',
                unit_show: true,
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current_power',
                text: 'power',
                unit_show: true,
            }
        ],

        //LIMITS
        group1: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_latency_ping',
                text: 'Latency Ping',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_latency_pong',
                text: 'Latency Pong',
                unit_show: true,                
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_timestamp_config_response',
                text: 'Last Config Update',
            },{
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_timestamp_data_transfer',
                text: 'Last Data transfer',
            },
        ],

        //INFO
        group2: [
            {
                entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_id',
                text: 'S/N',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_id_tag',
                text: 'TagID',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_reconnects',
                text: 'Reconnects',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_transaction_id',
                text: 'TransactionID',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_model',
                text: 'Model',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_features',
                text: 'OCPP features',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_temperature',
                text: 'Temperature',
                unit_show: true,
            },
        ],

        //CONFIG
        group3: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_version_firmware',
                text: 'Firmware',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_status_firmware',
                text: 'Firmware-status',
            },
            {
                entity_id: 'number.' +edt.ENTITYPREFIX +'_maximum_current',
                text: 'Current Limit',
                icon: 'mdi:current-ac',
                type: 'dropdown',
                service: 'number.set_value',
                service_data: {entity_id: 'number.' +edt.ENTITYPREFIX +'_maximum_current', value: edt.SERVICEVAL},
            },
        ],

        //STATS - based on state of main entity, default if state not found
        stats: {

            default: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_stop_reason',
                    text: 'Stop reason',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code_connector',
                    text: 'Error (connector)',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code',
                    text: 'Error (ocpp)',
                }
            ],

            Available: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_stop_reason',
                    text: 'Stop reason',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code_connector',
                    text: 'Error (connector)',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code',
                    text: 'Error (ocpp)',
                }
            ],

            SuspendedEV: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_session',
                    text: 'Energy charged',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_stop_reason',
                    text: 'Stop reason',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code_connector',
                    text: 'Error (connector)',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code',
                    text: 'Error (ocpp)',
                }
            ],

            Preparing: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_stop_reason',
                    text: 'Stop reason',
                },
            ],

            Charging: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_energy_session',
                    text: 'session_energy',
                    unit_show: true,
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_stop_reason',
                    text: 'Stop reason',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code_connector',
                    text: 'Error (connector)',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_error_code',
                    text: 'Error (ocpp)',
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_current_offered',
                    text: 'Max Current',
                },                
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_time_session',
                    text: 'Charging time elapsed',
                },                

            ],
        },

        // TOOLBAR
        toolbar_left: {
            default: [
                {
                    service: 'switch.toggle',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Toggle charging',
                    icon: 'hass:flash',
                },
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },    
                {
                    service: 'number.set_value',
                    service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                    type: 'dropdown',
                    text: 'Set max current',
                    icon: 'hass:current-ac',
                },                                
            ],

            Available: [
                    {
                        service: 'switch.toggle',
                        service_data: {entity_id: edt.SERVICEID_ENTITY},
                        text: 'Toggle charging',
                        icon: 'hass:flash',
                    },
                    {
                        service: 'button.press',
                        service_data: {entity_id: edt.SERVICEID_ENTITY},
                        text: 'Restart charger',
                        icon: 'hass:restart',
                    },    
                    {
                        service: 'number.set_value',
                        service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                        type: 'dropdown',
                        text: 'Set max current',
                        icon: 'hass:current-ac',
                    },                                
    
            ],

            SuspendedEV: [
                {
                    service: 'switch.turn_off',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Stop charging',
                    icon: 'hass:flash-alert',
                },
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },    
                {
                    service: 'number.set_value',
                    service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                    type: 'dropdown',
                    text: 'Set max current',
                    icon: 'hass:current-ac',
                },                                

            ],

            SuspendedEVSE: [
                {
                    service: 'switch.turn_on',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Stop charing',
                    icon: 'hass:flash-alert',
                },
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },
                {
                    service: 'number.set_value',
                    service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                    type: 'dropdown',
                    text: 'Set max current',
                    icon: 'hass:current-ac',
                },                                

            ],

            Charging: [
                {
                    service: 'switch.turn_off',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Stop charging',
                    icon: 'hass:stop',
                },
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },
                {
                    service: 'number.set_value',
                    service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                    type: 'dropdown',
                    text: 'Set max current',
                    icon: 'hass:current-ac',
                },                     
            ],

            Finishing: [
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },
                {
                    service: 'switch.toggle',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Toggle charging',
                    icon: 'hass:flash',
                },                
            ],
            Preparing: [
                {
                    service: 'switch.turn_on',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Stop charing',
                    icon: 'hass:flash-alert',
                },
                {
                    service: 'button.press',
                    service_data: {entity_id: edt.SERVICEID_ENTITY},
                    text: 'Restart charger',
                    icon: 'hass:restart',
                },
                {
                    service: 'number.set_value',
                    service_data: {entity_id: edt.SERVICEID_ENTITY, value: edt.SERVICEVAL},
                    type: 'dropdown',
                    text: 'Set max current',
                    icon: 'hass:current-ac',
                },                      
            ],
        },
        }

}

