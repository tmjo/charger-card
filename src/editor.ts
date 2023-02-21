/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent,   ActionHandlerEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';

import { localize } from './localize/localize';
import {cconst, CARDTEMPLATES} from './internals';
import type { template, ChargerCardConfig, cardDetails} from './types';

@customElement('charger-card-editor')
export class ChargerCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ChargerCardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...switchDefinition,
    ...formfieldDefinition,
  };

  public setConfig(config: ChargerCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _brand(): string{
    if (this._config) {
      return this._config.brand || '';
    }
    return '';
  }

  get _customCardTheme(): string{
    if (this._config) {
      return this._config.customCardTheme || '';
    }
    return cconst.DEFAULT_CUSTOMCARDTHEME;
  }
  get _chargerImage(){
    if (this._config) {
      return this._config.chargerImage || cconst.DEFAULT_IMAGE;
    }
    return cconst.DEFAULT_IMAGE;
  }

  get _customImage(): string{
    if (this._config) {
      return this._config.customImage || '';
    }
    return '';
  }

  get _config_details(): cardDetails{
    if (this._config) {
      return this._config.details || {};
    }
    return {};
  }


  get _compact_view(): boolean{
    if (this._config) {
      return this._config.compact_view !== undefined ? this._config.compact_view : false;
    }
    return false;
  }

  get _show_name(): boolean{
    if (this._config) {
      return this._config.show_name !== undefined ? this._config.show_name : true;
    }
    return true;
  }

  get _show_leds(): boolean{
    if (this._config) {
      return this._config.show_leds !== undefined ? this._config.show_leds : true;
    }
    return true;
  }

  get _show_status(): boolean{
    if (this._config) {
      return this._config.show_status !== undefined ? this._config.show_status : true;

    }
    return true;
  }

  get _show_collapsibles(): boolean{
    if (this._config) {
      return this._config.show_collapsibles !== undefined ? this._config.show_collapsibles : true;
    }
    return true;
  }

  get _show_stats(): boolean{
    if (this._config) {
      return this._config.show_stats !== undefined ? this._config.show_stats : true;
    }
    return true;
  }
  get _show_toolbar(): boolean{
    if (this._config) {
      return this._config.show_toolbar !== undefined ? this._config.show_toolbar : true;
    }
    return true;
  }

  get debug():boolean {
    if (this._config) {
      return this._config.debug !== undefined ? this._config.debug : false;
    }
    return false;

  }  


  protected render(): TemplateResult | void {
    
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states);

    return html`

      <strong>
        ${localize('editor.instruction')}
      </strong>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('editor.entity')}"
        .configValue=${'entity'}
        .value=${this._entity}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${entities.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('editor.brand')}"
        .configValue=${'brand'}
        .value=${this._brand}
        @selected=${this._setBrandTemplateDetails}
        @closed=${(ev) => ev.stopPropagation()}
      >
      
        ${Object.values(CARDTEMPLATES).map((cfg:template) => {
          return html`<mwc-list-item .value=${cfg.config.domain}>${cfg.config.name}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('editor.theme')}"
        .configValue=${'customCardTheme'}
        .value=${this._customCardTheme}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${Object.values(cconst.CARD_THEMES).map(theme => {
          return html`<mwc-list-item .value=${theme.name}>${theme.desc}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('editor.chargerImage')}"
        .configValue=${'chargerImage'}
        .value=${this._chargerImage}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${Object.keys(cconst.CHARGER_IMAGES).map(chargerImage => {
          return html`<mwc-list-item .value=${chargerImage}>${chargerImage}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-textfield
        label="${localize('editor.customImage')}"
        .value=${this._customImage}
        .configValue=${'customImage'}
        @input=${this._valueChanged}
      ></mwc-textfield>

      <mwc-formfield .label=${localize(this._compact_view?'editor.compact_view_aria_label_off':'editor.compact_view_aria_label_on')}>
        <mwc-switch
          .checked=${this._compact_view !== false}
          .configValue=${'compact_view'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_name?'editor.show_name_aria_label_off':'editor.show_name_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_name !== false}
          .configValue=${'show_name'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_leds?'editor.show_leds_aria_label_off':'editor.show_leds_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_leds !== false}
          .configValue=${'show_leds'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_status?'editor.show_status_aria_label_off':'editor.show_status_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_status !== false}
          .configValue=${'show_status'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_collapsibles?'editor.show_collapsibles_aria_label_off':'editor.show_collapsibles_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_collapsibles !== false}
          .configValue=${'show_collapsibles'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_stats?'editor.show_stats_aria_label_off':'editor.show_stats_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_stats !== false}
          .configValue=${'show_stats'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>

      <mwc-formfield .label=${localize(this._show_toolbar?'editor.show_toolbar_aria_label_off':'editor.show_toolbar_aria_label_on')}>
        <mwc-switch
          .checked=${this._show_toolbar !== false}
          .configValue=${'show_toolbar'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
      <br>



      <strong>
          ${localize('editor.code_only_note')}
      </strong>      

    `;
  }


  private _setBrandTemplateDetails(ev): void {
    if (this != undefined && this._config != undefined && ev != null && ev.target !=null){
      // SKIP EQUAL OR EMPTY BRAND CONFIG  
      if (this._config["brand"] == ev.target.value || ev.target.value == '') return;

      // SKIP EMPTY ENTITY, MUST BE SELECTED FIRST
      if (this._config["entity"] === undefined || this._config["entity"] == '') return;

      this._valueChanged(ev);
      const brand = ev.target.value;
      let entityprefix, serviceid;      

      const cardtemplate = CARDTEMPLATES[CARDTEMPLATES.findIndex((cfg:template) => cfg.config.domain === brand)];

      // Use main entity as default unless given otherwise in template
      const service_entity = cardtemplate.config.serviceid_data["entity"] != null ? cardtemplate.config.serviceid_data["entity"] : this._config.entity;

      // Get which data to use for service calls
      switch (cardtemplate.config.serviceid) {
        case cconst.TEMPLATE_EDITOR.SERVICEID_ENTITY:
          serviceid = service_entity;
          break;
        case cconst.TEMPLATE_EDITOR.SERVICEID_STATE:
          if(this != undefined && this.hass != undefined) serviceid = this.hass.states[service_entity].state;
          break;
        case cconst.TEMPLATE_EDITOR.SERVICEID_ATTR:
          if(this != undefined && this.hass != undefined){  
          }
          if(this != undefined && this.hass != undefined && cardtemplate.config.serviceid_data["attr"] != null) serviceid = this.hass.states[service_entity].attributes[cardtemplate.config.serviceid_data["attr"]]; 
          break;
        case cconst.TEMPLATE_EDITOR.SERVICEID_DEVICE:
          try{
            if(this != undefined && this.hass != undefined) serviceid = this.hass["entities"][service_entity].device_id;
          }catch(err){
            console.error("Could not find device_id of " +service_entity +"!");
          }
      }

      // Set prefix by domain
      entityprefix = this._config.entity.split('.')[1].replace(cardtemplate.config.domainbase, '');

      // Replace template with actual data
      try {
        let templateconfig_str = JSON.stringify(cardtemplate.details);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.ENTITYPREFIX, entityprefix);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.SERVICEID, this._config.entity);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.SERVICEID_DEVICE, serviceid);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.SERVICEID_ENTITY, serviceid);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.SERVICEID_STATE, serviceid);
        templateconfig_str = this.replaceAll(templateconfig_str, cconst.TEMPLATE_EDITOR.SERVICEID_ATTR, serviceid);       
        cardtemplate.details = JSON.parse(templateconfig_str);
      } catch (err) {
        console.error("Something went wrong with the default setup, please check your YAML configuration or enable debugging to see details.")
      }
      this.log("domain: " + brand +", entityprefix: " +entityprefix +", serviceid: " +serviceid);
      this.log(cardtemplate);
    
      // Set config
      const details:cardDetails = {};
      for (const data in cardtemplate.details) {
        details[`${data}`] = cardtemplate.details[data];
      }
      this._config = { ...this._config, ...cardtemplate.defaults};
      if(this._config !== undefined){
        this._config["details"] = { ...this._config.details, ...details };
      }

      fireEvent(this, 'config-changed', { config: this._config });
      return;
    }
    return;
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  private log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  }  

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }



  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
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

  static styles: CSSResultGroup = css`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;
}
