/** VOLKSWAGEN e-GOLF */

export const MAIN_ENTITY_BASE = '_position';  //Defines what should be replaced from main entity name to use as template for other entities
export const DEFAULT_CONFIG = {
    show_leds: false,
}

export const DEFAULT_DETAILS = {
    //NAME, LOCATION, STATUS ETC
    name: 'e-Golf',
    status: {
        entity_id: 'device_tracker.#ENTITYPREFIX#_position',
    },
    substatus: {
        entity_id: 'binary_sensor.#ENTITYPREFIX#_request_in_progress',
    },

    // OVERRIDE CURRENTLIMITS
    currentlimits: [0, 6, 10, 16, 20, 25, 32],

    // OVERRIDE STATE TEXT - also overrides translation
    statetext: {
        home: 'home',
        away: 'away',
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
        entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_connected',
        text: 'connected'
        }
    ],
    info_right: [
        {
            entity_id: 'sensor.#ENTITYPREFIX#_battery_level',
            text: 'soc',
            unit_show: true,
        },{
            entity_id: 'switch.#ENTITYPREFIX#_charging',
            text: 'charging',
            icon: 'mdi:ev-station',
        },{
            entity_id: 'sensor.#ENTITYPREFIX#_charging_time_left',
            text: 'time_left',
            unit_show: true,
        }
    ],

    //LIMITS
    group1: [
    ],

    //INFO
    group2: [
        {
            entity_id: 'sensor.#ENTITYPREFIX#_battery_level',
            text: 'soc'
        },
        {
            entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_connected',
            text: 'connected'
        },
        {
            entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_locked',
            text: 'cable_locked'
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
            text: 'range'
        },
        {
            entity_id: 'binary_sensor.#ENTITYPREFIX#_energy_flow',
            text: 'energy_flow'
        },
        {
            entity_id: 'binary_sensor.#ENTITYPREFIX#_external_power',
            text: 'external_power'
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
            text: 'avg_consumption'
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_outside_temperature',
            text: 'outside_temperature'
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_odometer',
            text: 'odometer'
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_climatisation_target_temperature',
            text: 'climate_target_temp'
        },
    ],

    //CONFIG
    group3: [
        {
            entity_id: 'switch.#ENTITYPREFIX#_charging',
            text: 'charging'
        },
        {
            entity_id: 'switch.#ENTITYPREFIX#_climatisation_from_battery',
            text: 'clima_from_battery'
        },
        {
            entity_id: 'switch.#ENTITYPREFIX#_electric_climatisation',
            text: 'electric_climatisation'
        },
        {
            entity_id: 'switch.#ENTITYPREFIX#_window_heater',
            text: 'window_heater'
        },
        {
            entity_id: 'switch.#ENTITYPREFIX#_force_data_refresh',
            text: 'force_data_refresh'
        },
        {
            entity_id: 'lock.#ENTITYPREFIX#_door_locked',
            text: 'door_locked'
        },

        {
            entity_id: 'lock.#ENTITYPREFIX#_trunk_locked',
            text: 'trunk_locked'
        },
    ],

    //STATS - based on state of main entity, default if state not found
    stats: {

        default: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_odometer',
                text: 'odometer'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
                text: 'range'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
                text: 'avg_consumption'
            }
        ],

        home: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_odometer',
                text: 'odometer'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
                text: 'range'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
                text: 'avg_consumption'
            },
            {
                entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_connected',
                text: 'connected'
            },

        ],

        away: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_last_connected',
                text: 'last_connected'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
                text: 'range'
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
                text: 'range'
            },
        ],

    },

    // TOOLBAR
    toolbar_left: {
        default: [
            {},
            ],

        disconnected: [
            {},
        ],

        awaiting_start: [
            {
                service: 'easee.stop',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'stop',
                icon: 'hass:stop',
            },
            {
                service: 'easee.resume',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'resume',
                icon: 'hass:play',
            },
            {
                service: 'easee.override_schedule',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'override',
                icon: 'hass:motion-play',
            },

        ],

        charging: [
            {
                service: 'easee.stop',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'stop',
                icon: 'hass:stop',
            },
            {
                service: 'easee.pause',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'pause',
                icon: 'hass:pause',
            },
        ],

        completed: [
            {
                service: 'easee.stop',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'stop',
                icon: 'hass:stop',
            },
            {
                service: 'easee.override_schedule',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'override',
                icon: 'hass:motion-play',
            },
        ],

        error: [
            {
                service: 'easee.reboot',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'reboot',
                icon: 'hass:restart',
            },
        ],
        ready_to_charge: [
            {
                service: 'easee.stop',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'stop',
                icon: 'hass:stop',
            },
            {
                service: 'easee.override_schedule',
                service_data: {charger_id: '#SERVICEID#'},
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
                conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available',
            },
            ],

        disconnected: [
            {
                service: 'easee.update_firmware',
                service_data: {charger_id: '#SERVICEID#'},
                text: 'update',
                icon: 'mdi:file-download',
                conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available',
            },
        ],
    },

};

