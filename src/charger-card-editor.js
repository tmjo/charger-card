import { LitElement, html, css } from 'lit-element';
import { fireEvent } from 'custom-card-helpers';
import localize from './localize';
import * as cconst from './const';
// let easee = await import('./const_easee.js');
import * as easee from './const_easee.js';

export class ChargerCardEditor extends LitElement {
  static get properties() {
    return {
      hass: Object,
      _config: Object,
      _toggle: Boolean,
    };
  }

  setConfig(config) {
    this._config = config;

    if (!this._config.entity) {
      this._config.entity = this.getAllEntitiesByType('sensor')[0] || '';
      fireEvent(this, 'config-changed', { config: this._config });
    }
  }

  // get _brand("brand")() {
  //   if (this._config) {
  //     return this._config.brand || '';
  //   }

  //   return '';
  // }

  // get _prefix() {
  //   if (this._config) {
  //     return this._config.prefix || '';
  //   }

  //   return '';
  // }

  get_config(item) {
    if (this._config) {
      return this._config[`${item}`] || '';
    }
    return '';

  }

  get_sensors(sensor) {
    if (this._config) {
      // console.log("TEST (" + sensor + "): " + this._config[`${sensor}`]);
      return this._config[`${sensor}`] || '';
    }
    return '';
  }

  // get _entity() {
  //   if (this._config) {
  //     return this._config.entity || '';
  //   }

  //   return '';
  // }

  // get _customImage() {
  //   if (this._config) {
  //     return this._config.customImage || '';
  //   }

  //   return '';
  // }

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

  getAllEntities(type) {
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


        <paper-dropdown-menu label="${localize('editor.brand')}" @value-changed=${this.setCardConfigType} .configValue=${'brand'}>
          <paper-listbox slot="dropdown-content" .selected=${Object.values(cconst.CARDCONFIGTYPES).indexOf(this.get_config("brand"))}>
            ${Object.values(cconst.CARDCONFIGTYPES).map(brand => {
              return html` <paper-item>${brand}</paper-item> `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>


        ${this.setEntityPrefix()}

        <paper-dropdown-menu label="${localize('editor.entity')}" @value-changed=${this._valueChanged} .configValue=${'entity'}>
          <paper-listbox slot="dropdown-content" .selected=${allEntities.indexOf(this.get_config("entity"))}>
            ${allEntities.map(entity => {
              return html` <paper-item>${entity}</paper-item> `;
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


  setEntityPrefix() {
    try{
        this._config = {
          ...this._config,
          ["prefix"]:
            this._config.entity
              .split('.')[1]
              .replace(easee.MAIN_ENTITY_BASE, ''),
        };
      }catch (err) {

      }
    }

  getEntityId(entitybasename) {
    try {
      return (
        entitybasename.split('.')[0] +
        '.' +
        this._config["prefix"] +
        '_' +
        entitybasename.split('.')[1]
      );
    } catch (err) {
      return null;
    }
  }


  setCardConfigType(ev) {
    const target = ev.target;

    // if (this[`_${target.configValue}`] === target.value) {
    if (this._config[`${target.configValue}`] === target.value) {
      console.log("SETCARDCONFIGTYPE EQUAL");
      return;
    }

    console.log(this._config[`${target.configValue}`]);
    console.log(target.value);

    // if (this.get_config("brand") === "Easee") {
    if (target.value === cconst.CARDCONFIGTYPES.easee) {
      // console.log("SETCARDCONFIGTYPE EASEE");
      // for (let entity in easee.ENTITIES_ALL) {
      //   // console.log("EASEE: " +entity +" --> " +cconst.ENTITIES[entity]);
      //   this._config = {
      //     ...this._config,
      //     [`${entity}`]:
      //       this.getEntityId(easee.ENTITIES_ALL[entity]),
      //   };
      // }
    }else if(target.value === cconst.CARDCONFIGTYPES.test){
      console.log("SETCARDCONFIGTYPE TEST");
      for (let entity in easee.DEFAULT_CONFIG) {
        this._config = {
          ...this._config,
          [`${entity}`]:
            easee.DEFAULT_CONFIG[entity],
        };
      }
    } else {
    //   console.log("SETCARDCONFIGTYPE OTHER");
    //   const allEntities = this.getAllEntities();
    //   return html`${cconst.ENTITIES_CARD.map(customentity => {
    //     // return html`<paper-input label="${customentity}" .value="" .configValue=${customentity}"></paper-input>`;
    //     return html`<paper-dropdown-menu label="${customentity}" @value-changed=${this._valueChanged} .configValue=${customentity}>
    //     <paper-listbox slot="dropdown-content" .selected=${allEntities.indexOf(this.get_sensors(customentity))}>
    //       ${allEntities.map(entity => {
    //       return html` <paper-item>${entity}</paper-item> `;
    //     })}
    //     </paper-listbox>
    //   </paper-dropdown-menu>`

    //   })}
    // `;
    }
    this._valueChanged(ev)
    fireEvent(this, 'config-changed', { config: this._config });
    return;
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
