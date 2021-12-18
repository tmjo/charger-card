# EV Charger Card

[![hacs][hacs-badge]][hacs-url]
[![Buy Me A Coffee][buymeacoffee-image]][buymeacoffee-url]

> EV Charger card for [Home Assistant][home-assistant] Lovelace UI

By default, Home Assistant does not provide any card for controlling chargers for electrical vehicles (EVs). This card displays the state and allows to control your charger.

![Preview of charger-card][preview-image]

**💡 Tip:** If you like this project consider buying me a cup of ☕️:

<a href="https://www.buymeacoffee.com/tmjo" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" width="150px">
</a>




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
4. Add `custom:charger-card` to Lovelace UI as any other card (using either editor or YAML configuration).


# Configuring and using the card
This card can be configured using Lovelace UI editor.

1. In Lovelace UI, click 3 dots in top left corner.
2. Click _Configure UI_.
3. Click Plus button to add a new card.
4. Find _Custom: Charger Card_ in the list.
5. Choose `entity` and select the main status sensor of your charger.
6. Now you should see the preview of the card!
7. Do your customizations in UI editor or manually in code editor.

_Sorry, there is no support for `actions` and `stats` in visual UI editor yet._

Typical example of using this card in YAML config would look like this:

```yaml
type: 'custom:charger-card'
entity: sensor.easee_status
```

Here is a list of the basic options. See _advanced configuration_ further down for more details.

| Name                |   Type    | Default      | Description                                                                                                         |
| ------------------- | :-------: | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `type`              | `string`  | **Required** | `custom:charger-card`                                                                                               |
| `brand`             | `string`  | **Required** | Select the template charger or system. If available it will try to set a pre-defined setup for your system and will assume you have all entities with default names from the integration. You can still edit your configuration in YAML if you system does not comply with these assumptions. See advanced config for further details. |
| `entity`            | `string`  | **Required** | The main status sensor for your charger (for Easee, look for the one named `status`).                                    |
| `customCardTheme`   | `string`  | Optional     | Select a built-in theme of colors, or use `theme_custom` to apply the theme you have applied in HA.                             |
| `chargerImage`      | `string`  | Anthracite   | Select a charger image from the built-in default images                                                                                |
| `customImage`       | `string`  | Optional     | Path to custom image of your charger (`png` or `svg`). This will override the chargerImage selection. (For images in www folder of HA, try path ``\local\image.png``|
| `compact_view`      | `boolean` | `false`      | Show a compact view of the card.                                                                                      |
| `show_name`         | `boolean` | `true`       | Show a friendly name of the charger and the location (if provided)                                                                                  |
| `show_leds`         | `boolean` | `true`       | Show status leds for the charger, fits best with Easee chargers and when using built-in images.                                                    |
| `show_status`       | `boolean` | `true`       | Show status of the charger.                                                                                         |
| `show_collapsibles` | `boolean` | `true`       | Show the collapsible menu buttons which will open detailed sensors when clicked.                                       |
| `show_toolbar`      | `boolean` | `true`       | Show a toolbar with actions.                                                                                          |
| `show_stats`        | `boolean` | `true`       | Show data table (stats).                                       |
| `stats`             | `object`  | Optional     | Custom data table (stats) depending on charger state. This option must be configured in YAML-editor, no UI-support for configuration. See advanced configuration for details.                      |
| `toolbar_left`           | `object`  | Optional     | Custom toolbar buttons, left aligned at the bottom. This option must be configured in YAML-editor, no UI-support for configuration. See advanced configuration for details.        |
| `toolbar_right`           | `object`  | Optional     | Custom toolbar buttons, right aligned at the bottom. This option must be configured in YAML-editor, no UI-support for configuration. See advanced configuration for details.    |

### `stats` object

In addition to the charger info, you can use any sensor or sensor attribute of your choosing to be shown in the stats data table section. It can depend on charger status or you can use `default` to select one that shows for all charger states. See advanced configuration for examples.

### `toolbar_left / toolbar_right` objects

You can define custom services to be run when clicking a button on the toolbar (right or left) as you prefer. It can depend on charger status or you can use `default` to select one that shows for all charger states. See advanced configuration for examples.

## Features

- Fully customizable for your needs, the card may work for different chargers and other entities if you read the Advanced configuration section and customize it to your needs. For chargers that are supported by defaut, the setup is very easy (select brand and main entity and you should be done).
- Animations: If choosing the default images of Easee chargers in any color, you can also choose to show leds which will behave according to charger status. This is identical to how the charger looks physically and similar to the Easee app and web site. Two leds for standby, all leds when connected, flashing while charging and so on. If SmartCharging is enabled, leds will be blue.
- Collapsible menu buttons: Click on one of the menu buttons (if you enabled them) to get more info, config or limit settings.
- Possibility to set current limits from UI
- Stats items (data table) will depend on charger status and show most relevant information unless you choose to customize it
- Action items on toolbar will depend on charger status and show most relevant actions. Custom actions are added in addition to defaults.

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
This card was originally made to support charging robots from <a href='https://easee-international.com/'>Easee</a>, but has been further developed to be fully configurable and customizable. It can even be used for other things than EV-chargers. Some brands added with built-in support to make the configuration really easy:

- Easee
- [_Your charger?_][edit-readme]


# Advanced configuration
If your brand is on the list of supported models, you should be able to get away by just selecting the brand from the UI editor of Home Assistant and easily configuring some basic options. However, if you want to customize it or use it for something else, an advanced YAML-configuration is shown below. It may seem overwhelming at first, so a trick can be applying a built-in brand and start modifying the YAML code from there. This will give you the basic structure.

Most details can be overridden on most features by using the following keywords:

## Entity config table

| Config           |   Text |
| -------------- | --------|
| entity_id     | Specify an entity id that you want to use for the specific feature. Enter `calculated` to perform mathematical functions instead, see below.|
| attribute     | You can specify an attribute of the entity to use this instead of entity state as value. |
| unit          | Card will use the entity `unit_of_measurement` as default, but you can override it here.|
| unit_show:    | Define if the unit should be shown next to the value or not.|
| unit_showontext| Define if the value and unit should be shown next to the tooltip text|
| text|          Card will use the entity `friendly_name` as default, but you can override it here. Used as tooltip text for icons and as information on stats.|
| service       | You can specify a service that you wish to link to the entity, check available services in HA Developer Tools. Use full format like `domain.servicename`|
| service_data | Specify the service data corresponding to the service you defined. See advanced configuration for example.|
| icon|          Card will use the entity icon as default, and will try to detect device class icons as well. If you want to override it, do it here.|
| round| If you would like to round down the number, specify an integer to define the number of digits.|
| type| Choose between `info`, `service` and `dropdown`. Info-items will appear as icons with tooltip, clicking them opens the specified entity. Service-items will do the same, but call a service when clicked (if it is provided). Dropdown-items will show a dropdown list to select from a list and call a specified service with this number as service data.|
| calc_function | Choose between `min`, `max`, `mean`, `sum` to define a mathematical function to be performed on a specified list of entities or attributes. The result will be used on the sensor provided you specify `calculated` as the main `entity_id`.|
| calc_entities | A list of entites or entity attributes that are used for the mathematical function. Specify a list of `entity_id`s and add `attribute`s if you prefer to use that.|
| conditional_entity | Specify a boolean entity (returning on/off or true/false) to define if the entity should be shown based on state condition.
| conditional_attribute | Specify a boolean entity and its attribute (returning on/off or true/false) to define if the entity should be shown based on state attribute condition.
| conditional_invert | Invert the conditional rule, so that true/on means hide and false/off means show


## Main items
| Config           |   Text |
| -------------- | --------|
| debug |  Set this to true if you want debugging info, this is important if something doesn't work out right for you and you want to report it.
| name |  Single entity with configuration details as shown in table above.
| location | Single entity with configuration details as shown in table above.
| status | Single entity with configuration details as shown in table above.
| substatus | Single entity with configuration details as shown in table above.
| smartcharging | Single entity with configuration details as shown in table above. Controls white or blue leds for easee chargers.
| info_right | List of entities with configuration details as shown in table above. Defines static icons shown top-left of the card.
| info_right | List of entities with configuration details as shown in table above. Defines static icons shown top-right of the card.
| group1 | List of entities with configuration details as shown in table above. Defines the content of first collapsible-button (default limits).
| group2 | List of entities with configuration details as shown in table above. Defines the content of second collapsible-button (default info).
| group3 | List of entities with configuration details as shown in table above. Defines the content of third collapsible-button (default config).
| stats | Provide the state of entity defined as status-sensor, then a list of entities with configuration details as shown in table above. Defines the datatable statistics (stats) in lower part of card, will change depending on status of charger. See example.
| toolbar_left | Provide the state of entity defined as status-sensor, the a list of entities with configuration details as shown in table above. Defines the left aligned command buttons of the toolbar. See example.
| toolbar_right | Provide the state of entity defined as status-sensor, the a list of entities with configuration details as shown in table above. Defines the right aligned command buttons of the toolbar.
| currentlimits | Override the card default current limits by specifying a list of numbers. Used for current limit features of the card (if configured).
| statetext | Override or custom-translate the status sensor state by providing better or cleaner text. See example.
| collapsiblebuttons | Specify `text` and/or `icon` to customize the collapsible-buttons `group1`,`group2` and `group3` respectively. See example.

## Advanced example (Easee charger)

```yaml
type: custom:charger-card
entity: sensor.CHARGERNAME_status
prefix: CHARGERNAME
customCardTheme: theme_custom
chargerImage: Red
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
info_left:
  - entity_id: binary_sensor.CHARGERNAME_online
    text: Online
info_right:
  - entity_id: sensor.CHARGERNAME_voltage
    text: Voltage
  - entity_id: sensor.CHARGERNAME_power
    text: Power
group1:
  - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
    text: Dyn. charger limit
  - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
    text: Dyn. circuit limit
  - entity_id: sensor.CHARGERNAME_max_charger_limit
    text: Charger limit
  - entity_id: sensor.CHARGERNAME_max_circuit_limit
    text: Circuit limit
  - entity_id: sensor.CHARGERNAME_offline_circuit_limit
    text: Offline circuit limit
  - entity_id: sensor.CHARGERNAME_output_limit
    text: Output limit
group2:
  - entity_id: binary_sensor.CHARGERNAME_online
    text: Online
  - entity_id: sensor.CHARGERNAME_voltage
    text: Voltage
  - entity_id: sensor.CHARGERNAME_power
    text: Power
  - entity_id: sensor.CHARGERNAME_current
    text: Current
  - entity_id: sensor.CHARGERNAME_circuit_current
    text: Circuit Current
  - entity_id: sensor.CHARGERNAME_energy_per_hour
    text: Energy per hour
  - entity_id: sensor.CHARGERNAME_lifetime_energy
    text: Total energy
  - entity_id: sensor.CHARGERNAME_session_energy
    text: Total energy
group3:
  - entity_id: switch.CHARGERNAME_is_enabled
    text: Enabled
  - entity_id: switch.CHARGERNAME_enable_idle_current
    text: Idle Current
  - entity_id: binary_sensor.CHARGERNAME_cable_locked
    text: Cable locked
  - entity_id: switch.CHARGERNAME_cable_locked_permanently
    text: Perm. locked
  - entity_id: switch.CHARGERNAME_smart_charging
    text: Smart charging
  - entity_id: sensor.CHARGERNAME_cost_per_kwh
    text: Cost per kWh
  - entity_id: binary_sensor.CHARGERNAME_update_available
    text: Update available
  - entity_id: binary_sensor.CHARGERNAME_basic_schedule
    text: Schedule
stats:
  default:
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
  disconnected:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: switch.CHARGERNAME_cable_locked_permanently
      text: CableLocked
    - entity_id: calculated
      text: Used Limit
      unit: A
      calc_function: min
      calc_entities:
        - entity_id: sensor.CHARGERNAME_dynamic_charger_limit
        - entity_id: sensor.CHARGERNAME_dynamic_circuit_limit
        - entity_id: sensor.CHARGERNAME_max_charger_limit
        - entity_id: sensor.CHARGERNAME_max_circuit_limit
        - entity_id: sensor.CHARGERNAME_offline_circuit_limit
  awaiting_start:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
    - entity_id: switch.CHARGERNAME_smart_charging
      text: SmartCharging
  charging:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: sensor.CHARGERNAME_energy_per_hour
      text: Rate
    - entity_id: sensor.CHARGERNAME_circuit_current
      text: Circuit
    - entity_id: sensor.CHARGERNAME_output_limit
      text: Allowed
    - entity_id: sensor.CHARGERNAME_current
      text: Actual
    - entity_id: sensor.CHARGERNAME_power
      text: Power
  completed:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
  error:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
  ready_to_charge:
    - entity_id: sensor.CHARGERNAME_session_energy
      text: Energy
    - entity_id: binary_sensor.CHARGERNAME_basic_schedule
      text: Schedule
toolbar_left:
  default:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:play-pause
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:motion-play
  disconnected:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: mdi:cancel
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: mdi:cancel
  awaiting_start:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:play-pause
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:motion-play
  charging:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:pause
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:stop
  completed:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:stop
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:motion-play
  error:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:restart
  ready_to_charge:
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:stop
    - service: persistent_notification.create
      service_data:
        message: test1
        title: test
      text: Schedule
      icon: hass:motion-play
currentlimits:
  - 10
  - 16
  - 20
  - 25
  - 32
statetext:
  disconnected: Disconnected
  awaiting_start: Paused or awaiting start
  charging: Charging
  completed: Completed or awaiting car
  error: Error
  ready_to_charge: Ready to charge
collapsiblebuttons:
  - group1:
      text: Click for limits
      icon: mdi:speedometer
  - group2:
      text: Click for info
      icon: mdi:information
  - group3:
      text: Click for config
      icon: mdi:cog
brand: Test



```

# Other stuff
## Development
Want to contribute to the project? Translations? Adding your brand?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.

## Inspiration

This project is heavily inspired by <a href="https://github.com/denysdovhan" target="_blank">denysdovhan</a>, the ideas are taken from his <a href="https://github.com/denysdovhan/vacuum-card" target="_blank">vacuum card</a>. Make sure to <a href="https://www.buymeacoffee.com/denysdovhan" target="_blank">buy him a coffee</a> too!


## License
MIT © [Tor Magne Johannessen][tmjo]

<!-- Badges -->

[npm-url]: https://npmjs.org/package/charger-card
[hacs-url]: https://github.com/custom-components/hacs
[hacs-image]: https://img.shields.io/badge/HACS-Custom-orange.svg
[hacs-badge]: https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge(https://github.com/hacs/integration)
[buymeacoffee-url]: https://www.buymeacoffee.com/tmjo
[buymeacoffee-image]: https://img.shields.io/badge/support-buymeacoffee-222222.svg?style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[preview-image]: https://user-images.githubusercontent.com/54450177/97765425-56874900-1b12-11eb-9c0c-87721e0b5748.png
[latest-release]: https://github.com/tmjo/lovelace-charger-card/releases/latest
[ha-scripts]: https://www.home-assistant.io/docs/scripts/
[edit-readme]: https://github.com/tmjo/lovelace-charger-card/edit/master/README.md
[add-translation]: https://github.com/tmjo/lovelace-charger-card/tree/master/src/translations
[tmjo]: https://github.com/tmjo
