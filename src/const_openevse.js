/** OpenEVSE */

//Defines what should be replaced from main entity name to use as template for other entities
export const MAIN_ENTITY_BASE = '_charging_status';

//OVERRIDE CARD CONFIG WHEN BRAND TEMPLATE SELECTED (for instance turn off leds if they don't make any sense)
export const DEFAULT_CONFIG = {
    show_leds: false,
}

// CONFIG DETAILS
export const DEFAULT_DETAILS = {
    // DETAILS ITEMS (APPLY THE ONES YOU NEED)
        // name                             // A plain text or an entity item
        // location                         // A plain text or an entity item
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
        // #ENTITYPREFIX#                      // This will be replaced with what is found from main sensor entity after removing MAIN_ENTITY_BASE
        // #SERVICEID#                         // A replacement used in the service call, typically for a chargerid or something that must be part of the data when calling service of a specific charger.
        // #SERVICEVAL#                        // A replacement used in the service call, typically for the value from a dropdown or similar. Use this in the template where for instance a current limit is supposed to be sent to a charger.


    //NAME, LOCATION, STATUS ETC
    name: 'Charger',
    location: 'Home',
    status: {
        entity_id: 'sensor.#ENTITYPREFIX#_charging_status',
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
        //     entity_id: 'sensor.#ENTITYPREFIX#_charging_voltage',
        //     text: 'voltage',
        //     unit_show: true,
        // },{
        //     entity_id: 'sensor.#ENTITYPREFIX#_charging_current',
        //     text: 'current',
        //     unit_show: true,
        // }
    ],
    info_right: [
        {
            entity_id: 'sensor.#ENTITYPREFIX#_charging_voltage',
            text: 'Voltage',    //TODO: should be replaced with translation tag
            unit_show: true,
        },{
            entity_id: 'sensor.#ENTITYPREFIX#_charging_current',
            text: 'Current',    //TODO: should be replaced with translation tag
            unit_show: true,
        }
    ],

    //LIMITS
    group1: [
        {
            entity_id: 'sensor.#ENTITYPREFIX#_max_current',
            text: 'Max current',                //TODO: should be replaced with translation tag
            service: 'openevse.set_max_current',
            service_data: {charger_id: '#SERVICEID#', current: '#SERVICEVAL#'},
        },
        {
            entity_id: 'sensor.#ENTITYPREFIX#_max_amps',
            text: 'Max amps',                   //TODO: should be replaced with translation tag
        },
    ],

    //INFO
    // group2: [
    //     {
    //         entity_id: 'binary_sensor.#ENTITYPREFIX#_online',
    //         text: 'online',
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_voltage',
    //         text: 'voltage',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_power',
    //         text: 'power',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_current',
    //         text: 'charger_current',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_circuit_current',
    //         text: 'circuit_current',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_energy_per_hour',
    //         text: 'energy_per_hour',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
    //         text: 'session_energy',
    //         unit_show: true,
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_lifetime_energy',
    //         text: 'lifetime_energy',
    //         unit_show: true,
    //     },
    // ],

    //CONFIG
    // group3: [
    //     {
    //         entity_id: 'switch.#ENTITYPREFIX#_is_enabled',
    //         text: 'enabled',
    //     },
    //     {
    //         entity_id: 'switch.#ENTITYPREFIX#_enable_idle_current',
    //         text: 'idle_current',
    //     },
    //     {
    //         entity_id: 'binary_sensor.#ENTITYPREFIX#_cable_locked',
    //         text: 'cable_locked',
    //     },
    //     {
    //         entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
    //         text: 'perm_cable_locked',
    //     },
    //     {
    //         entity_id: 'switch.#ENTITYPREFIX#_smart_charging',
    //         text: 'smart_charging',
    //     },
    //     {
    //         entity_id: 'sensor.#ENTITYPREFIX#_cost_per_kwh',
    //         text: 'cost_per_kwh',
    //     },
    //     {
    //         entity_id: 'binary_sensor.#ENTITYPREFIX#_update_available',
    //         text: 'update_available',
    //     },
    //     {
    //         entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
    //         text: 'schedule',
    //     }
    // ],

    //STATS - based on state of main entity, default if state not found
    stats: {

        default: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_ambient_temperature',
                text: 'Ambient temperature',    //TODO: should be replaced with translation tag
                unit_show: true,
            },
        ],

        disabled: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_total_usage',
                text: 'Total usage',    //TODO: should be replaced with translation tag
                unit_show: true,
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_current_power_usage',
                text: 'Power',    //TODO: should be replaced with translation tag
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_max_amps',
                text: 'Max amps',       //TODO: should be replaced with translation tag
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_usage_this_session',
                text: 'Session energy',       //TODO: should be replaced with translation tag
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_ambient_temperature',
                text: 'Temperature',       //TODO: should be replaced with translation tag
            },
        ],

        active: [
            {
                entity_id: 'sensor.#ENTITYPREFIX#_current_power_usage',
                text: 'Power',              //TODO: should be replaced with translation tag
                unit_show: true,
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_current_capacity',
                text: 'Current',            //TODO: should be replaced with translation tag
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_usage_this_session',
                text: 'Session energy',     //TODO: should be replaced with translation tag
            },
            {
                entity_id: 'sensor.#ENTITYPREFIX#_ambient_temperature',
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
                service_data: {charger_id: '#SERVICEID#'},
                text: 'stop',
                icon: 'hass:stop',
            },
            {
                service: 'openevse.pause',
                service_data: {charger_id: '#SERVICEID#'},
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
    //             conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available',
    //         },
    //         ],

    //     disconnected: [
    //         {
    //             service: 'easee.update_firmware',
    //             service_data: {charger_id: '#SERVICEID#'},
    //             text: 'update',
    //             icon: 'mdi:file-download',
    //             conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available',
    //         },
    //     ],
    // },

};

