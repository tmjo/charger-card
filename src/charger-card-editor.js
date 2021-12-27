import { LitElement, html, css } from 'lit-element';
import { fireEvent } from 'custom-card-helpers';
import localize from './localize';
import * as cconst from './const';

import * as easee from './const_easee.js';
import * as template from './const_template.js';

export class ChargerCardEditor extends LitElement {
  static get properties() {
    return {
      hass: Object,
      _config: Object,
      _toggle: Boolean,
    };
  }

  get _chargerImage(){
    if (this._config) {
      return this._config.chargerImage || cconst.DEFAULT_IMAGE;
    }
    return cconst.DEFAULT_IMAGE;
  }

  get _customCardTheme(){
    if (this._config) {
      return this._config.customCardTheme || '';
    }
    return cconst.DEFAULT_CUSTOMCARDTHEME;
  }

  get _show_name() {
    if (this._config) {
      return this._config.show_name !== undefined ? this._config.show_name : true;
    }
    return true;
  }

  get _show_leds() {
    if (this._config) {
      return this._config.show_leds !== undefined ? this._config.show_leds : true;
    }
    return true;
  }

  get _show_status() {
    if (this._config) {
      return this._config.show_status !== undefined ? this._config.show_status : true;

    }
    return true;
  }

  get _show_toolbar() {
    if (this._config) {
      return this._config.show_toolbar !== undefined ? this._config.show_toolbar : true;
    }
    return true;
  }

  get _show_stats() {
    if (this._config) {
      return this._config.show_stats !== undefined ? this._config.show_stats : true;
    }
    return true;
  }

  get _show_collapsibles() {
    if (this._config) {
      return this._config.show_collapsibles !== undefined ? this._config.show_collapsibles : true;
    }
    return true;
  }


  get _compact_view() {
    if (this._config) {
      return this._config.compact_view !== undefined ? this._config.compact_view : false;
    }
    return false;
  }

  get debug() {
    if (this._config) {
      return this._config.debug !== undefined ? this._config.debug : false;
    }
    return false;

  }

  setConfig(config) {
    this._config = config;

    if (!this._config.entity) {
      this._config.entity = this.getAllEntitiesByType('sensor')[0] || '';
      fireEvent(this, 'config-changed', { config: this._config });
    }
  }

  get_config(item) {
    if (this._config) {
      return this._config[`${item}`] || '';
    }
    return '';

  }

  log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  }

  // get_sensors(sensor) {
  //   if (this._config) {
  //     return this._config[`${sensor}`] || '';
  //   }
  //   return '';
  // }

  getAllEntities() {
    return Object.keys(this.hass.states)
  }

  getAllEntitiesByType(type) {
    return Object.keys(this.hass.states).filter(
      (eid) => eid.substr(0, eid.indexOf('.')) === type
    );
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const allEntities = this.getAllEntities();

    return html`
      <div class="card-config">

      <strong>
      ${localize('editor.instruction')}
      </strong>

        <paper-dropdown-menu label="${localize('editor.entity')}" @value-changed=${this._valueChanged} .configValue=${'entity'}>
          <paper-listbox slot="dropdown-content" .selected=${allEntities.indexOf(this.get_config("entity"))}>
            ${allEntities.map(entity => {
              return html` <paper-item>${entity}</paper-item> `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.brand')}" @value-changed=${this.setCardConfigType} .configValue=${'brand'}>
          <paper-listbox slot="dropdown-content" .selected=${cconst.CARDCONFIGTYPES.findIndex(brand => brand.domain === this.get_config("brand"))}>
            ${Object.values(cconst.CARDCONFIGTYPES).map(brand => {
              return html` <paper-item>${brand.domain}</paper-item> `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.theme')}" @value-changed=${this._valueChanged} .configValue=${'customCardTheme'}>
          <paper-listbox slot="dropdown-content" selected="${this._customCardTheme}" attr-for-selected="value">
            ${cconst.CARD_THEMES.map(customCardTheme => {
              return html` <paper-item value="${customCardTheme.name}">${customCardTheme.name}</paper-item> `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.chargerImage')}" @value-changed=${this._valueChanged} .configValue=${'chargerImage'}>
          <paper-listbox slot="dropdown-content" selected="${this._chargerImage}" attr-for-selected="value">
            ${cconst.CHARGER_IMAGES.map(chargerImage => {
              return html` <paper-item value="${chargerImage.name}">${chargerImage.name}</paper-item> `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-input label="${localize('editor.customImage')}" .value=${this.get_config("customImage")} .configValue=${'customImage'} @value-changed=${this._valueChanged}"></paper-input>
        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._compact_view
                ? 'editor.compact_view_aria_label_off'
                : 'editor.compact_view_aria_label_on'
            )}
            .checked=${this._compact_view !== false}
            .configValue=${'compact_view'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.compact_view')}
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._show_name
                ? 'editor.show_name_aria_label_off'
                : 'editor.show_name_aria_label_on'
            )}
            .checked=${this._show_name}
            .configValue=${'show_name'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_name')} [${this._show_name}]
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._show_leds
                ? 'editor.show_leds_aria_label_off'
                : 'editor.show_leds_aria_label_on'
            )}
            .checked=${this._show_leds !== false}
            .configValue=${'show_leds'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_leds')}
        </p>


        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._show_status
                ? 'editor.show_status_aria_label_off'
                : 'editor.show_status_aria_label_on'
            )}
            .checked=${this._show_status !== false}
            .configValue=${'show_status'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_status')}
        </p>

        <p class="option">
        <ha-switch
          aria-label=${localize(
            this._show_collapsibles
              ? 'editor.show_collapsibles_aria_label_off'
              : 'editor.show_collapsibles_aria_label_on'
          )}
          .checked=${this._show_collapsibles !== false}
          .configValue=${'show_collapsibles'}
          @change=${this._valueChanged}
        >
        </ha-switch>
        ${localize('editor.show_collapsibles')}
      </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._show_stats
                ? 'editor.show_stats_aria_label_off'
                : 'editor.show_stats_aria_label_on'
            )}
            .checked=${this._show_stats}
            .configValue=${'show_stats'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_stats')}
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(
              this._show_toolbar
                ? 'editor.show_toolbar_aria_label_off'
                : 'editor.show_toolbar_aria_label_on'
            )}
            .checked=${this._show_toolbar !== false}
            .configValue=${'show_toolbar'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_toolbar')}
        </p>

        <strong>
          ${localize('editor.code_only_note')}
        </strong>
      </div>
    `;
  }


  setCardConfigType(ev) {
    // SKIP EQUAL OR EMPTY BRAND CONFIG
    if (this._config["brand"] == ev.target.value || ev.target.value == '') return;

    // SKIP EMPTY ENTITY, MUST BE SELECTED FIRST
    if (this._config["entity"] === undefined || this._config["entity"] == '') return;

    this._valueChanged(ev);
    let brand = ev.target.value;
    let domainconfig, domainbase, entityprefix, serviceid;

    let cardconfig = cconst.CARDCONFIGTYPES[cconst.CARDCONFIGTYPES.findIndex(brandObj => brandObj.domain === brand)];
    domainconfig = cardconfig.domainconfig;
    domainbase = cardconfig.domainbase;

    // Use main entity as default unless given otherwise in template
    if (cardconfig.serviceid_data.entity === null) cardconfig.serviceid_data.entity = this._config.entity;

    // Get which data to use for service calls
    switch (cardconfig.serviceid) {
      case cconst.SERVICEID_ENTITY:
        serviceid = cardconfig.serviceid_data.entity;
        break;
      case cconst.SERVICEID_STATE:
        serviceid = this.hass.states[cardconfig.serviceid_data.entity].state;
        break;
      case cconst.SERVICEID_ATTR:
        serviceid = this.hass.states[cardconfig.serviceid_data.entity].attributes[cardconfig.serviceid_data.attr];
        break;
    }

    // Set prefix by domain
    entityprefix = this._config.entity.split('.')[1].replace(domainbase, '');


    // Replace template with actual data
    try {
      var domainconfig_str = JSON.stringify(domainconfig);
      domainconfig_str = this.replaceAll(domainconfig_str, cconst.ENTITYPREFIX, entityprefix);
      domainconfig_str = this.replaceAll(domainconfig_str, cconst.SERVICEID, serviceid);
      domainconfig = JSON.parse(domainconfig_str);
    } catch (err) {
      console.error("Something went wrong with the default setup, please check your YAML configuration or enable debugging to see details.")
    }
    this.log("domain: " + brand +", entityprefix: " +entityprefix +", serviceid: " +serviceid);
    this.log(domainconfig);

    // Set config
    for (let data in domainconfig) {
      this._config = {
        ...this._config,
        [`${data}`]:
          domainconfig[data],
      };
    }



    fireEvent(this, 'config-changed', { config: this._config });
    return;
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      console.log("C: no config")
      return;
    }
    const target = ev.target;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles() {
    return css`
      .card-config paper-dropdown-menu {
        width: 100%;
      }

      .option {
        display: flex;
        align-items: center;
      }

      .option ha-switch {
        margin-right: 10px;
      }
    `;
  }
}

customElements.define('charger-card-editor', ChargerCardEditor);
