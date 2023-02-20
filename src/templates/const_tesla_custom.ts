/** EASEE CHARGING ROBOT */
import { TEMPLATE_EDITOR } from '../const';
import type { template } from './../types';
import {TEMPLATE_EDITOR as edt} from './../const';

export const data:template = {
    config: {
        'domain': 'tesla_custom',
        'name': 'Tesla EV Custom Integration',
        'domainbase': '_charger',
        'serviceid': edt.SERVICEID_DEVICE,
        'serviceid_data': {entity: null, attr: 'id' },   
    },
    defaults:{
        show_leds: true,        
    },
    details:{
        //NAME, LOCATION, STATUS ETC
        name: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_state_data',
            attribute: 'vehicle_name',
        },
        location: {
            entity_id: 'device_tracker.' +edt.ENTITYPREFIX +'_location_tracker',
        },
        status: {
            entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_charger',
        },
        substatus: {
            entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging',
            attribute: 'charge_port_latch',
        },
        smartcharging: {
            //controls white or blue leds
            entity_id: 'binary_sensor.' +edt.ENTITYPREFIX +'_charger',
            attribute: 'fast_charger_type',
        },

        // OVERRIDE CURRENTLIMITS
        currentlimits: [0, 1, 8, 16],

        // OVERRIDE STATE TEXT - also overrides translation
        statetext: {
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
                text: 'state',
            },
        ],
        info_right: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_battery',
                icon: 'mdi:car-electric-outline',
                unit: '%',
                unit_show: true,
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charger_power',
                text: 'power',
                unit_show: true,
            },
            {
                entity_id: 'number.' +edt.ENTITYPREFIX +'_charging_amps',
                text: 'amp',
                unit: 'A',
                unit_show: true,
                icon: 'mdi:current-ac',
            }

        ],
        //INFO
        group2: [
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_voltage',
                text: 'voltage',
                unit_show: true,
                unit: 'V',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_amps_actual',
                text: 'amp',
                unit_show: true,
                unit: 'A',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_power',
                text: 'Power',
                unit_show: true,
                unit: 'kW',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charge_energy_added',
                text: 'Energy added',
                unit_show: true,
                unit: 'kWh',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charge_current_request',
                text: 'Request',
                unit_show: true,
                unit: 'A',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_actual_current',
                text: 'Actual',
                unit_show: true,
                unit: 'A',
            },
            {
                entity_id: 'switch.' +edt.ENTITYPREFIX +'_charger',
                text: 'Charger switch',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_voltage',
                text: 'voltage',
                unit_show: true,
                unit: 'V',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_voltage',
                text: 'voltage',
                unit_show: true,
                unit: 'V',
            },
            {
                entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                attribute: 'charger_voltage',
                text: 'voltage',
                unit_show: true,
                unit: 'V',
            },
        ],

        //STATS - based on state of main entity, default if state not found
        stats: {

            default: [
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charging_rate',
                    attribte: 'time_left',
                    text: 'remaining',
                    unit_show: true,
                    unit: 'hrs'
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'energy_added',
                    text: 'Energy added',
                    unit_show: true,
                    unit: 'kWh'
                },
                {
                    entity_id: 'sensor.' +edt.ENTITYPREFIX +'_charger_power',
                    text: 'Request',
                    attribute: 'charger_amps_request',
                    unit: 'A',
                    unit_show: true,
                },
                {
                    entity_id: 'number.' +edt.ENTITYPREFIX +'_charging_amps',
                    text: 'Actual',
                    unit: 'A',
                    unit_show: true,
                },
                {
                    entity_id: 'switch.' +edt.ENTITYPREFIX +'_charger',
                    text: 'Request',
                }                                
            ],

        },

        // TOOLBAR
        toolbar_left: {
            default: [
                // {},
                ],


        },
        toolbar_right: {
            default: [
                // {},
                ],
        },

        }

}

