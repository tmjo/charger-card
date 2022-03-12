  # EV Charger Card

[![hacs][hacs-badge]][hacs-url]
[![Buy me a coffee](https://img.shields.io/static/v1.svg?label=Buy%20me%20a%20coffee&message=🥨&color=black&logo=buy%20me%20a%20coffee&logoColor=white&labelColor=6f4e37)](https://www.buymeacoffee.com/tmjo)

> EV Charger card for [Home Assistant][home-assistant] Lovelace UI

OBS! This readme reflects the latest release candidate for testing which brings a lot of breaking changes since the card is made generic. See [here](https://github.com/tmjo/charger-card/blob/a324cd30b7139c70c37d2d8973e4f64b2f511280/README.md) for an older version which is currently the latest official release.



By default, Home Assistant does not provide any card for controlling chargers for electrical vehicles (EVs). This card displays the state and allows to control your charger - and it is now made fully customizable so you could also use it for «anything» else as well, for instance your electric car.

![Preview of charger-card][preview-image]

**💡 Tip:** If you like this project consider buying me a cup of ☕️:

<a href="https://www.buymeacoffee.com/tmjo" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" width="150px">
</a>

<br>
<br>
<br>


# Installation

### Installation with HACS

Installation with [HACS][hacs] (Home Assistant Community Store) is highly reccomended but requires that you have this installed on your Home Assistant. The charger-card is available just by searching for `Charger Card` under the Frontend-section of HACS.

### Manual

1. Download `charger-card.js` file from the [latest-release].
2. Put `charger-card.js` file into your `config/www` folder.
3. Add reference to `charger-card.js` in Lovelace. There are two ways to do that:
   1. **Using UI:** _Configuration_ → _Lovelace Dashboards_ → _Resources_ → Click Plus button → Set _Url_ as `/local/charger-card.js` → Set _Resource type_ as `JavaScript Module`.
   2. **Using YAML:** Add following code to `lovelace` section.
      ```yaml
      resources:
        - url: /local/charger-card.js
          type: module
      ```
4. Add `custom:charger-card` to Lovelace UI as any other card (using either UI-editor or YAML-configuration).

# Configuring and using the card

After installation, the card can be configured either using Lovelace UI editor or YAML-code.

1. In Lovelace UI, click 3 dots in top left corner.
2. Click _Configure UI_.
3. Click Plus button to add a new card.
4. Find _Custom: Charger Card_ in the list.
5. Choose `brand` from the list which fits your need or select other.
6. Choose `entity` and select the main status sensor of your charger.
7. Now you should see the preview of the card!
8. Do your customizations in UI editor or manually in the YAML code editor.

A minimum example of using this card in YAML config would look like this:

```yaml
type: 'custom:charger-card'
brand: easee
entity: sensor.easee_status
```

Here is a list of the basic options. See [_advanced configuration_](#advanced-configuration) further down for more details.

| Name                               |   Type    | Default      | Description                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | :-------: | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                             | `string`  | **Required** | `custom:charger-card`                                                                                                                                                                                                                                                                                                                  |
| `brand`                            | `string`  | **Required** | Select the template charger or system. If available it will try to set a pre-defined setup for your system and will assume you have all entities with default names from the integration. You can still edit your configuration in YAML if you system does not comply with these assumptions. See advanced config for further details. |
| `entity`                           | `string`  | **Required** | The main status sensor for your charger (for Easee, look for the one named `status`).                                                                                                                                                                                                                                                  |
| `customCardTheme`                  | `string`  | Optional     | Select a built-in theme of colors, or use `theme_custom` to apply the theme you have applied in HA.                                                                                                                                                                                                                                    |
| `chargerImage`                     | `string`  | Anthracite   | Select a charger image from the built-in default images                                                                                                                                                                                                                                                                                |
| `customImage`                      | `string`  | Optional     | Path to custom image of your charger (`png` or `svg`). This will override the chargerImage selection. (For images in the www-folder of HA, try path `\local\image.png`                                                                                                                                                                     |
| `compact_view`                     | `boolean` | `false`      | Show a compact view of the card.                                                                                                                                                                                                                                                                                                       |
| `show_name`                        | `boolean` | `true`       | Show a friendly name of the charger and the location (if provided)                                                                                                                                                                                                                                                                     |
| `show_leds`                        | `boolean` | `true`       | Show status leds for the charger, fits best with Easee chargers and when using built-in images.                                                                                                                                                                                                                                        |
| `show_status`                      | `boolean` | `true`       | Show status of the charger.                                                                                                                                                                                                                                                                                                            |
| `show_collapsibles`                | `boolean` | `true`       | Show the collapsible menu buttons which will open detailed sensors when clicked.                                                                                                                                                                                                                                                       |
| `show_toolbar`                     | `boolean` | `true`       | Show a toolbar with buttons that can call a service or do stuff.                                                                                                                                                                                                                                                                       |
| `show_stats`                       | `boolean` | `true`       | Show data table (stats).  |
| `details`                       | `details` | Optional        | Details for customization if the default brand template doesn't do what you want it to. This mus be done manually with YAML-code. See [_advanced configuration_](#advanced-configuration)  |




## Features

- Fully customizable for your needs, the card works for different chargers and other entities if you read the [_advanced configuration_](#advanced-configuration) section and customize it to your needs. For chargers that are supported by default templates, the setup is very easy: select brand and main entity and you should be done.
- Animations: If choosing the default images of Easee chargers in any color, you can also choose to show leds which will behave according to charger status. This is identical to how the charger looks physically and similar to the Easee app and web site. Two leds for standby, all leds when connected, flashing while charging and so on. If SmartCharging is enabled, leds will be blue.
- Collapsible menu buttons: Click on one of the menu buttons (if you have enabled them) to get more info, config or limit settings. Can also be customized.
- Possibility to set current limits from UI. Current limits can also be customized.
- Customizable data table (stats) items that can depend on charger status and show relevant information.
- Customizable toolbar with buttons to call services or do something which. The toolbar can depend on charger status and show relevant actions.

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

- English
- Norsk bokmål (Norwegian)
- Svenska (by [jockesoft](https://github.com/jockesoft))
- German (by [DeerMaximum](https://github.com/DeerMaximum))
- Danish (by [dykandDK](https://github.com/dykandDK))
- Catalan (by [gerardag](https://github.com/gerardag))
- [_Your language?_][add-translation]

## Supported models

This card was originally made to support charging robots from [Easee](https://easee-international.com/), but has been further developed to be fully configurable and customizable and can be used with any kind of charger. It can even be used for other things than EV-chargers, for instance your electric car or something completely different. Some `brand`s are added with built-in support to make the configuration really easy:

- Easee
- [_Your charger?_][edit-readme]

# Advanced configuration

If your brand is on the list of supported models, you should be able to get away just by selecting the `brand` and `entity` main sensor from the UI editor of Home Assistant. However, if you want to fully customize it or use it for something else than supported by default `brand`s, you must do this yourself with YAML-code. It may seem overwhelming at first, so a trick can be applying a built-in `brand` as a template and start modifying the YAML code from there - this will give you the basic structure. Also see the examples further down.

| Name                               |   Type    | Default      | Description                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | :-------: | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug`                             | `boolean`  | `false` | Apply `true` to enable some debugging features which will appear in Developer Tools of your browser (Ctrl+Shift+I in Chrome). Useful if something doesn't work.
| `localize`                             | `boolean`  | `true` | Apply `false` to disable all translations, for instance if you want to fully customize texts and the translation feature for some reason messes up you stuff. Normally not necessary.
| `details`                       | `details` |        | Details for customization if the default brand template doesn't do what you want it to. See [`details`-items](#details-items)  |



## Details items

| Config             | Text         |
| ------------------ | ------------------------------------------------- |
| name               | Single entity with configuration details as shown in [`entity`-items](#entity-items). |
| location           | Single entity with configuration details as shown in [`entity`-items](#entity-items). |
| status             | Single entity with configuration details as shown in [`entity`-items](#entity-items). |
| substatus          | Single entity with configuration details as shown in [`entity`-items](#entity-items). |
| smartcharging      | Single entity with configuration details as shown in [`entity`-items](#entity-items). Controls white or blue leds for easee chargers.|
| info_left          | List of entities with configuration details as shown in [`entity`-items](#entity-items). Defines static icons shown top-left of the card.|
| info_right         | Same as `info_left`, but for static icons shown top-right of the card.|
| group1             | List of entities with configuration details as shown in [`entity`-items](#entity-items). Defines the content of first collapsible-button (default: limits).|
| group2             | List of entities with configuration details as shown in [`entity`-items](#entity-items). Defines the content of second collapsible-button (default: info).|
| group3             | List of entities with configuration details as shown in [`entity`-items](#entity-items). Defines the content of third collapsible-button (default: config).|
| stats              | Provide the states of `entity` defined as main status sensor, then a list of entities with configuration details as shown in [`entity`-items](#entity-items). Defines the datatable statistics (stats) in lower part of card. It may change depending on status of charger, or it is possible to define `default` as a state. See example. |
| toolbar_left       | Provide the states of `entity` defined as main status sensor, then a list of entities with configuration details as shown in [`entity`-items](#entity-items). Defines the left aligned command buttons on the toolbar at the bottom of the card. It may change depending on status of charger, or it is possible to define `default` as a state. See example.                                                     |
| toolbar_right      | Same as `toolbar_left` but right aligned command buttons on the toolbar.                                           |
| currentlimits      | Override the card default current limits by specifying a list of numbers. Used for current limit features of the card (if configured).|
| statetext          | Override or custom-translate the status sensor state by providing better or cleaner text. See example.|
| collapsiblebuttons | Specify `text` and/or `icon` to customize the collapsible-buttons `group1`,`group2` and `group3` respectively. See example.|


## Entity items

| Config                | Text                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity_id             | Specify an entity id that you want to use for the specific feature. Enter `calculated` to perform mathematical functions instead, see further down how.|
| attribute             | You can specify an attribute of the entity to use instead of entity state as value. |
| unit                  | Card will use the entity `unit_of_measurement` as default, but you can override it here by entering the unit you want.|
| unit_show             | Define if the unit should be shown next to the value or not.|
| unit_showontext       | Define if the value and unit should be shown next to the tooltip text|
| text                  | Card will use the entity `friendly_name` as default, but you can override it here by entering the text you want. Used as tooltip text for icons and as information on stats.|
| service               | You can specify a service that you wish to link to the entity, check available services in HA Developer Tools. Use full format like `domain.servicename`|
| service_data          | Specify the service data corresponding to the service you want to call. If it is not a static call, but for instance a call with a value selected from a dropdown menu, enter `#SERVICEVAL#` as a special token which will be replaced by the card when called. See advanced configuration for example. |
| icon                  | Card will use the entity icon as default, and will try to detect device class icons as well. If you want to override it, do it here by specifying a valid icon.|
| round                 | If you would like to round down the number, specify an integer to define the number of digits.|
| type                  | Choose between `info`, `service` and `dropdown`. Info-items will appear as icons with tooltip, clicking them opens the more-info popup for the entity. Service-items will do the same, but call a service when clicked (if it is provided). Dropdown-items will show a dropdown list to select from a list and call a specified service with this number as service data. |
| calc_function         | Choose between `min`, `max`, `mean`, `sum` to define a mathematical function to be performed on a specified list of entities or attributes. The result will be used on the sensor provided you specify `calculated` instead of a real `entity_id`. Then add a list of entities to be calculated in `calc_entities`.|
| calc_entities         | A list of entites or entity attributes that are used for the mathematical function. Specify a list of `entity_id`s and add `attribute`s if you prefer to use that.|
| conditional_entity    | Specify a boolean entity (returning on/off or true/false) to define if the entity should be shown based on state condition.|
| conditional_attribute | Specify a boolean entity and its attribute (returning on/off or true/false) to define if the entity should be shown based on state attribute condition.|
| conditional_invert    | Invert the conditional rule, so that true/on means hide and false/off means show |

## Advanced example (Easee charger)

```yaml
type: custom:charger-card
entity: sensor.CHARGERNAME_status
customCardTheme: theme_custom
chargerImage: Red
brand: easee
show_leds: true
details:
  name:
    entity_id: sensor.CHARGERNAME_status
    attribute: name
  location:
    entity_id: sensor.CHARGERNAME_status
    attribute: site_name
  status:
    entity_id: sensor.CHARGERNAME_status
  substatus:
    entity_id: sensor.CHARGERNAME_reason_for_no_current
  smartcharging:
    entity_id: switch.CHARGERNAME_smart_charging
  currentlimits:
    - 0
    - 6
    - 10
    - 16
    - 20
    - 25
    - 32
  statetext:
    disconnected: disconnected
    awaiting_start: awaiting_start
    charging: charging
    completed: completed
    error: error
    ready_to_charge: ready_to_charge
  collapsiblebuttons:
    group1:
      text: click_for_group1
      icon: mdi:speedometer
    group2:
      text: click_for_group2
      icon: mdi:information
    group3:
      text: click_for_group3
      icon: mdi:cog
  info_left:
    - entity_id: binary_sensor.CHARGERNAME_online
      text: online
  info_right:
    - entity_id: sensor.CHARGERNAME_voltage
      text: voltage
      unit_show: true
    - entity_id: sensor.CHARGERNAME_power
      text: power
      unit_show: true
  group1:
    - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
      text: dyn_charger_limit
      service: easee.set_charger_dynamic_limit
      service_data:
        charger_id: CHARGERID
        current: '#SERVICEVAL#'
    - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
      text: dyn_circuit_limit
      service: easee.set_charger_circuit_dynamic_limit
      service_data:
        charger_id: CHARGERID
        currentP1: '#SERVICEVAL#'
    - entity_id: sensor.CHARGERNAME_max_charger_limit
      text: max_charger_limit
      service: easee.set_charger_max_limit
      service_data:
        charger_id: CHARGERID
        current: '#SERVICEVAL#'
    - entity_id: sensor.CHARGERNAME_max_circuit_limit
      text: max_circuit_limit
      service: easee.set_circuit_max_limit
      service_data:
        charger_id: CHARGERID
        currentP1: '#SERVICEVAL#'
    - entity_id: sensor.CHARGERNAME_offline_circuit_limit
      text: offline_circuit_limit
      service: easee.set_charger_circuit_offline_limit
      service_data:
        charger_id: CHARGERID
        currentP1: '#SERVICEVAL#'
  group2:
    - entity_id: binary_sensor.CHARGERNAME_online
      text: online
    - entity_id: sensor.CHARGERNAME_voltage
      text: voltage
      unit_show: true
    - entity_id: sensor.CHARGERNAME_power
      text: power
      unit_show: true
    - entity_id: sensor.CHARGERNAME_current
      text: charger_current
      unit_show: true
    - entity_id: sensor.CHARGERNAME_circuit_current
      text: circuit_current
      unit_show: true
    - entity_id: sensor.CHARGERNAME_energy_per_hour
      text: energy_per_hour
      unit_show: true
    - entity_id: sensor.CHARGERNAME_session_energy
      text: session_energy
      unit_show: true
    - entity_id: sensor.CHARGERNAME_lifetime_energy
      text: lifetime_energy
      unit_show: true
  group3:
    - entity_id: switch.CHARGERNAME_is_enabled
      text: enabled
    - entity_id: switch.CHARGERNAME_enable_idle_current
      text: idle_current
    - entity_id: binary_sensor.CHARGERNAME_cable_locked
      text: cable_locked
    - entity_id: switch.CHARGERNAME_cable_locked_permanently
      text: perm_cable_locked
    - entity_id: switch.CHARGERNAME_smart_charging
      text: smart_charging
    - entity_id: sensor.CHARGERNAME_cost_per_kwh
      text: cost_per_kwh
    - entity_id: binary_sensor.CHARGERNAME_update_available
      text: update_available
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: schedule
  stats:
    default:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: switch.CHARGERNAME_cable_locked_permanently
        text: cable_locked
      - entity_id: binary_sensor.CHARGERNAME_basic_schedule
        text: schedule
    disconnected:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: switch.CHARGERNAME_cable_locked_permanently
        text: cable_locked
      - entity_id: calculated
        text: used_limit
        unit: A
        unit_show: true
        calc_function: min
        calc_entities:
          - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
          - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
          - entity_id: sensor.CHARGERNAME_max_charger_limit
          - entity_id: sensor.CHARGERNAME_max_circuit_limit
          - entity_id: sensor.CHARGERNAME_offline_circuit_limit
    awaiting_start:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: binary_sensor.CHARGERNAME_basic_schedule
        text: schedule
      - entity_id: switch.CHARGERNAME_smart_charging
        text: smart_charging
      - entity_id: calculated
        text: used_limit
        unit: A
        unit_show: true
        calc_function: min
        calc_entities:
          - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
          - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
          - entity_id: sensor.CHARGERNAME_max_charger_limit
          - entity_id: sensor.CHARGERNAME_max_circuit_limit
          - entity_id: sensor.CHARGERNAME_offline_circuit_limit
    charging:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: sensor.CHARGERNAME_energy_per_hour
        text: energy_per_hour
        unit_show: true
      - entity_id: sensor.CHARGERNAME_circuit_current
        text: circuit_current
        unit_show: true
      - entity_id: sensor.CHARGERNAME_output_limit
        text: output_limit
        unit_show: true
      - entity_id: sensor.CHARGERNAME_current
        text: current
        unit_show: true
      - entity_id: sensor.CHARGERNAME_power
        text: power
        unit_show: true
    completed:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: binary_sensor.CHARGERNAME_basic_schedule
        text: schedule
      - entity_id: calculated
        text: used_limit
        unit: A
        unit_show: true
        calc_function: min
        calc_entities:
          - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
          - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
          - entity_id: sensor.CHARGERNAME_max_charger_limit
          - entity_id: sensor.CHARGERNAME_max_circuit_limit
          - entity_id: sensor.CHARGERNAME_offline_circuit_limit
    error:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: binary_sensor.CHARGERNAME_basic_schedule
        text: schedule
    ready_to_charge:
      - entity_id: sensor.CHARGERNAME_session_energy
        text: session_energy
        unit_show: true
      - entity_id: binary_sensor.CHARGERNAME_basic_schedule
        text: schedule
      - entity_id: calculated
        text: used_limit
        unit: A
        unit_show: true
        calc_function: min
        calc_entities:
          - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
          - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
          - entity_id: sensor.CHARGERNAME_max_charger_limit
          - entity_id: sensor.CHARGERNAME_max_circuit_limit
          - entity_id: sensor.CHARGERNAME_offline_circuit_limit
  toolbar_left:
    default:
      - {}
    disconnected:
      - {}
    awaiting_start:
      - service: easee.stop
        service_data:
          charger_id: CHARGERID
        text: stop
        icon: hass:stop
      - service: easee.resume
        service_data:
          charger_id: CHARGERID
        text: resume
        icon: hass:play
      - service: easee.override_schedule
        service_data:
          charger_id: CHARGERID
        text: override
        icon: hass:motion-play
    charging:
      - service: easee.stop
        service_data:
          charger_id: CHARGERID
        text: stop
        icon: hass:stop
      - service: easee.pause
        service_data:
          charger_id: CHARGERID
        text: pause
        icon: hass:pause
    completed:
      - service: easee.stop
        service_data:
          charger_id: CHARGERID
        text: stop
        icon: hass:stop
      - service: easee.override_schedule
        service_data:
          charger_id: CHARGERID
        text: override
        icon: hass:motion-play
    error:
      - service: easee.reboot
        service_data:
          charger_id: CHARGERID
        text: reboot
        icon: hass:restart
    ready_to_charge:
      - service: easee.stop
        service_data:
          charger_id: CHARGERID
        text: stop
        icon: hass:stop
      - service: easee.override_schedule
        service_data:
          charger_id: CHARGERID
        text: override
        icon: hass:motion-play
  toolbar_right:
    default:
      - service: persistent_notification.create
        service_data:
          message: Firmware update is available, but only possible when disconnected!
          title: Update
        text: update
        icon: mdi:file-download
        conditional_entity: binary_sensor.CHARGERNAME_update_available
    disconnected:
      - service: easee.update_firmware
        service_data:
          charger_id: CHARGERID
        text: update
        icon: mdi:file-download
        conditional_entity: binary_sensor.CHARGERNAME_update_available
```

## Development
Want to contribute to the project? Translations? Adding your `brand` as a pre-defined template?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.





## License
MIT © [Tor Magne Johannessen][tmjo]

This project is heavily inspired by <a href="https://github.com/denysdovhan" target="_blank">denysdovhan</a>, and his <a href="https://github.com/denysdovhan/vacuum-card" target="_blank">vacuum card</a>. Thanks!

<!-- Badges -->
[npm-url]: https://npmjs.org/package/charger-card
[hacs-url]: https://github.com/custom-components/hacs
[hacs-image]: https://img.shields.io/badge/HACS-Custom-orange.svg
[hacs-badge]: https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge
[buymeacoffee-url]: https://www.buymeacoffee.com/tmjo


<!-- References -->
[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[preview-image]: https://user-images.githubusercontent.com/54450177/97765425-56874900-1b12-11eb-9c0c-87721e0b5748.png
[latest-release]: https://github.com/tmjo/lovelace-charger-card/releases/latest
[ha-scripts]: https://www.home-assistant.io/docs/scripts/
[edit-readme]: https://github.com/tmjo/lovelace-charger-card/edit/master/README.md
[add-translation]: https://github.com/tmjo/lovelace-charger-card/tree/master/src/translations
[tmjo]: https://github.com/tmjo
