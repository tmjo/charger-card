# EV Charger Card

[![npm version][npm-image]][npm-url]
[![hacs][hacs-image]][hacs-url]
[![Patreon][patreon-image]][patreon-url]
[![Buy Me A Coffee][buymeacoffee-image]][buymeacoffee-url]
[![Twitter][twitter-image]][twitter-url]

> EV Charger card for [Home Assistant][home-assistant] Lovelace UI

By default, Home Assistant does not provide any card for controlling chargers for electrical vehicles (EVs). This card displays the state and allows to control your charger.

![Preview of charger-card][preview-image]

## Installing

**💡 Tip:** If you like this project consider buying me a cup of ☕️ or 🥤:

<a href="https://www.buymeacoffee.com/denysdovhan" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" width="150px">
</a>

### HACS

This card is available in [HACS][hacs] (Home Assistant Community Store).

Just search for `Charger Card` in plugins tab.

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

## Using the card

This card can be configured using Lovelace UI editor.

1. In Lovelace UI, click 3 dots in top left corner.
2. Click _Configure UI_.
3. Click Plus button to add a new card.
4. Find _Custom: Charger Card_ in the list.
5. Choose `entity`.
6. Now you should see the preview of the card!

_Sorry, no support for `actions` and `stats` in visual config yet._

Typical example of using this card in YAML config would look like this:

```yaml
type: 'custom:charger-card'
entity: sensor.easee_1_status
```

Here is what every option means:

| Name           |   Type    | Default      | Description                                                             |
| -------------- | :-------: | ------------ | ----------------------------------------------------------------------- |
| `type`         | `string`  | **Required** | `custom:charger-card`                                                    |
| `entity`       | `string`  | **Required** | An entity_id within the `sensor` domain. Must be the main status of your charger.   |
| `image`        | `string`  | `default`    | Path to image of your vacuum cleaner. Better to have `png` or `svg`.    |
| `show_name`    | `boolean` | `true`       | Show friendly name of the vacuum.                                       |
| `show_status`  | `boolean` | `true`       | Show status of the vacuum.                                              |
| `show_toolbar` | `boolean` | `true`       | Show toolbar with actions.                                              |
| `compact_view` | `boolean` | `false`      | Compact view without image.                                             |
| `stats`        | `object`  | Optional     | Custom per state stats for your vacuum cleaner                          |
| `actions`      | `object`  | Optional     | Custom actions for your vacuum cleaner.                                 |

### `stats` object

You can use any attribute of vacuum or even any entity by `entity_id` to display by stats section:

| Name        |   Type   | Default  | Description                                     |
| ----------- | :------: | -------- | ----------------------------------------------- |
| `entity_id` | `string` | Optional | An entity_id with state, i.e. `sensor.vacuum`.  |
| `attribute` | `string` | Optional | Attribute name of the stat, i.e. `filter_left`. |
| `unit`      | `string` | Optional | Unit of measure, i.e. `hours`.                  |
| `subtitle`  | `string` | Optional | Friendly name of the stat, i.e. `Filter`.       |

### `actions` object

You can defined [custom scripts][ha-scripts] for custom actions i.e cleaning specific room and add them to this card with `actions` option.

| Name           |   Type   | Default                           | Description                                        |
| -------------- | :------: | --------------------------------- | -------------------------------------------------- |
| `name`         | `string` | Optional                          | Friendly name of the action, i.e. `Clean bedroom`. |
| `service`      | `string` | Optional                          | A service to call, i.e. `script.clean_bedroom`.    |
| `icon`         | `string` | Optional                          | Any icon for action button.                        |
| `service_data` | `object` | `service_data` for `service` call |

## Animations

I've added some animations for this card to make it alive. Animations are applied only for `image` property. Here's how they look like:

|              Cleaning               |                Docking                |
| :---------------------------------: | :-----------------------------------: |
| ![Cleaning anumation][cleaning-gif] | ![Returning anumation][returning-gif] |

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

- English
- Norsk bokmål (Norwegian)
- [_Your language?_][add-translation]

## Supported models

This card currently supports charging robots from <a href='https://easee-international.com/'>Easee</a>. It could be modified to support basically any charger, but adoptions of the code will be necessary since there is no platform in Home Assistant for chargers making the interface identical.

Supported chargers:
- Easee
- [_Your charger?_][edit-readme]

## Development

Want to contribute to the project?

First of all, thanks! Check [contributing guideline](./CONTRIBUTING.md) for more information.

## Inspiration

This project is heavily inspired by:
- <a href="https://github.com/denysdovhan" target="_blank">denysdovhan</a> for inspiration to this card, the ideas are taken from his <a href="https://github.com/denysdovhan/vacuum-card" target="_blank">vacuum card</a>. Make sure to buy him a <a href="https://www.buymeacoffee.com/denysdovhan" target="_blank">coffee</a> too!

Huge thanks for their ideas and efforts 👍

## License

MIT © [Tor Magne Johannessen][tmjo]

<!-- Badges -->

[npm-url]: https://npmjs.org/package/vacuum-card
[npm-image]: https://img.shields.io/npm/v/vacuum-card.svg?style=flat-square
[hacs-url]: https://github.com/custom-components/hacs
[hacs-image]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[patreon-url]: https://patreon.com/denysdovhan
[patreon-image]: https://img.shields.io/badge/support-patreon-F96854.svg?style=flat-square
[buymeacoffee-url]: https://patreon.com/denysdovhan
[buymeacoffee-image]: https://img.shields.io/badge/support-buymeacoffee-222222.svg?style=flat-square
[twitter-url]: https://twitter.com/denysdovhan
[twitter-image]: https://img.shields.io/badge/twitter-%40denysdovhan-00ACEE.svg?style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[preview-image]: https://user-images.githubusercontent.com/3459374/83282788-c9e30280-a1e2-11ea-8e13-6208169ddc0a.png
[cleaning-gif]: https://user-images.githubusercontent.com/3459374/81119202-fa60b500-8f32-11ea-9b23-325efa93d7ab.gif
[returning-gif]: https://user-images.githubusercontent.com/3459374/81119452-765afd00-8f33-11ea-9dc5-9c26ba3f8c45.gif
[latest-release]: https://github.com/denysdovhan/vacuum-card/releases/latest
[ha-scripts]: https://www.home-assistant.io/docs/scripts/
[edit-readme]: https://github.com/denysdovhan/vacuum-card/edit/master/README.md
[add-translation]: https://github.com/denysdovhan/vacuum-card/tree/master/src/translations
[macbury-smart-house]: https://macbury.github.io/SmartHouse/HomeAssistant/Vacuum/
[bbbenji-card]: https://gist.github.com/bbbenji/24372e423f8669b2e6713638d8f8ceb2
[denysdovhan]: https://denysdovhan.com
