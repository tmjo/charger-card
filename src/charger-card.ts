/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  fireEvent,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { ChargerCardConfig, cardEntity, cardServiceEntity} from './types';
import { actionHandler } from './action-handler-directive';
import { VERSION } from './const';
import { localize } from './localize/localize';
import styles from './styles';
import {cconst} from './internals';

/* eslint no-console: 0 */
console.info(
  `%c  CHARGER-CARD \n%c  ${localize('common.version')} ${VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'charger-card',
  name: 'Charger Card',
  description: 'A fully customizable charger-card for EV-chargers that can also work well for other devices.',
});

@customElement('charger-card')
export class ChargerCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('charger-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: true }) public hass!: HomeAssistant;

  @state() private config!: ChargerCardConfig;


  get brand() {
    return this.config.brand;
  }

  get entity() {
    if(this.config != undefined && this.config.entity != undefined){
      return this.hass.states[this.config.entity];
    }
    return undefined;
  }
  get entity_id() {
    if(this.config != undefined && this.config.entity != undefined){
      return this.config.entity;
    }
    return '';
  }


  get image() {
    let image;
    if (this.config.customImage !== undefined && this.config.customImage !== null && this.config.customImage !== '') {
      // For images in www try path \local\image.png
      image = this.config.customImage;
    } else {
      return cconst.CHARGER_IMAGES[this.config.chargerImage] || cconst.CHARGER_IMAGES[cconst.DEFAULT_IMAGE];
    }
    return image;
  }

  get customCardTheme() {
    if (this.config.customCardTheme === undefined) {
      return cconst.DEFAULT_CUSTOMCARDTHEME;
    }
    return this.config.customCardTheme;
  }

  get showLeds() {
    if (this.config.show_leds === undefined) {
      return true;
    }
    return this.config.show_leds;
  }

  get showName() {
    if (this.config.show_name === undefined) {
      return true;
    }
    return this.config.show_name;
  }

  get showStatus() {
    if (this.config.show_status === undefined) {
      return true;
    }
    return this.config.show_status;
  }

  get showStats() {
    if (this.config.show_stats === undefined) {
      return true;
    }
    return this.config.show_stats;
  }

  get showCollapsibles() {
    if (this.config.show_collapsibles === undefined) {
      return true;
    }
    return this.config.show_collapsibles;
  }

  get showToolbar() {
    if (this.config.show_toolbar === undefined) {
      return true;
    }
    return this.config.show_toolbar;
  }

  get compactView() {
    if (this.config.compact_view === undefined) {
      return false;
    }
    return this.config.compact_view;
  }

  get currentlimits() {
    if (this.config.details !== undefined && this.config.details.currentlimits !== undefined && Array.isArray(this.config.details.currentlimits)) {
      return this.config.details.currentlimits;
    }
    return cconst.DEFAULT_CURRENTLIMITS;
  }

  get statetext() {
    if (this.config.details !== undefined && this.config.details.statetext !== undefined && typeof this.config.details.statetext == 'object') {
      return this.config.details.statetext;
    }
    return [];
  }

  get debug() {
    if (this.config) {
      return this.config.debug !== undefined ? this.config.debug : false;
    }
    return false;
  }  

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: ChargerCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }else if(!config.entity){
      throw new Error(localize('error.missing_entity'));      
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Chargercard',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, true); // Probably not efficient to force update here?
  }

  handleMore(entity = this.entity) {
    fireEvent(
      this,
      'hass-more-info',
      {
        entityId: entity != null ? entity.entity_id : undefined,
      },
      {
        bubbles: true,
        composed: true,
      }
    );
  }


  getCardData(data) {
    let entities = {};

    if (data === undefined || data === null) {
      return null;
    } else if (typeof data == 'object' && Array.isArray(data)) {
        // ARRAYS OF ENTITY DATA
        for (const [key, val] of Object.entries(data)) {
          if (typeof val == 'object' && 'entity_id' in val) {
            entities[key] = this.getCardCheckData(val);
          }
      }
      return entities;
    } else if (typeof data == 'object' && ('entity_id' in data || 'text' in data)) {
        // SINGLE ENTITY DATA
        entities = this.getCardCheckData(data);
        return entities;

    } else if (typeof data == 'object'){
        // STATES DEPENDANT STUFF (STATS AND TOOLBAR)
        const stateobj = {};
        for (const [statekey, stateval] of Object.entries(data)) {
          const stateentities = {};
          if (stateval !== null && stateval != undefined) {           
              for (const [key, val] of Object.entries((stateval as {[index: string|number]: cardServiceEntity[]}[]))) {
              if (typeof val == 'object') {
                stateentities[key] = this.getCardCheckData(val);
              }
              stateobj[statekey] = stateentities;
            }
          }
        }
        return stateobj;
    } else {
      // STRINGS AND NON-OBJECTS
      entities = data;
    }
    // console.log(entities);
    return entities;
  }

  getCardCheckData(val) {
    const data = {};
      //Set defaults if not given in config
      data['entity_id'] = val.entity_id !== undefined ? val.entity_id : null;    
      data['unit'] = val.unit !== undefined ? val.unit : this.getEntityAttr(val.entity_id, 'unit_of_measurement');
      data['text'] = val.text !== undefined ? val.text : this.getEntityAttr(val.entity_id, 'friendly_name');
      data['icon'] = val.icon !== undefined ? val.icon : this.getEntityIcon(val.entity_id);
      data['unit_show'] = val.unit_show !== undefined ? val.unit_show : false;
      data['unit_showontext'] = val.unit_showontext !== undefined ? val.unit_showontext : false;
      data['round'] = val.round !== undefined ? val.round : false;
      data['type'] = val.type !== undefined ? val.type : 'info';
      data['attribute'] = val.attribute !== undefined ? val.attribute : null;
      data['useval'] = this.getEntityState(data["entity_id"]);
      data['service'] = val.service !== undefined ? val.service : null;
      data['service_data'] = val.service_data !== undefined ? val.service_data : null;
      data['type'] = val.type !== undefined ? val.type : null;
      data['conditional_entity'] = val.conditional_entity !== undefined ? val.conditional_entity : null;
      data['conditional_attribute'] = val.conditional_attribute !== undefined ? val.conditional_attribute : null;
      data['conditional_invert'] = val.conditional_invert !== undefined ? val.conditional_invert : null;

      // Get entity
      data['entity'] = this.getEntity(data["entity_id"]);

      // Use attribute if given in config
      if (data["entity"] !== null && data["attribute"] != null && data["attribute"] in data["entity"]["attributes"]) {
        data['useval'] = this.getEntityAttr(data["entity_id"], data["attribute"]);
      }

      // Calculated entities
      if (data["entity_id"] == 'calculated') {
        data['calc_function'] = val["calc_function"] !== undefined ? val["calc_function"] : null;
        data['calc_entities'] = val["calc_entities"] !== undefined ? val["calc_entities"] : null;
        if (data["calc_function"] !== null && data["calc_entities"] !== null) {
          try {
            data["useval"] = this.getEntityCalcVal(data["calc_function"], data["calc_entities"]);
          } catch (err) {
            console.error("The calculation you asked for didn't work, check your config (" +err +")");
          }
        }
      }

      //Apply rounding of number if specified, round to zero decimals if other than integer given (for instance true)
      if (data["round"]) {
        const decimals = Number.isInteger(data["round"]) ? data["round"] : 0;
        data["useval"] = this.round(data["useval"], decimals);
      }

      // Conditional entities
      if (data["conditional_entity"] !== undefined && data["conditional_entity"] !== null) {
        data['hide'] = false;
        let cond_state, cond_attr;
        cond_state = this.getEntityState(data["conditional_entity"]);
        data['hide'] = cond_state !== null && (cond_state == 'off' || cond_state == 'false' || cond_state === false) ? true : data['hide'];
        if (data["conditional_attribute"] !== undefined && data["conditional_attribute"] !== null) {
          cond_attr = this.getEntityAttr(data["conditional_entity"], data["conditional_attribute"]);
          data['hide'] = cond_attr !== null && (cond_attr == 'off' || cond_attr == 'false' || cond_attr === false) ? true : data['hide'];
        }

        if (data["conditional_invert"] === true) {
          data['hide'] = !data["hide"];
        }

      }

    return data;
  }

  loc(string, group = '', brand = null, search = '', replace = '') {
    //Do not translate numbers (some states are translated such as on/off etc)
    if(Number(string)){
      return string;
    }

    if ((this.config.localize === undefined || this.config.localize == true) ) {
      group = group != '' ? group + "." : group;
      
      this.log("Brand: " +brand +" group: " +group +" string: " +string +" search: " +search +" replace: " +replace);
      try{
        return localize(group +string, brand, search, replace, this.debug);
      }catch(err){
        return string;
      }
    } else {
      return string;
    }
  }

  getEntityCalcVal(calcfunc, entities) {
    let calc:number;
    calc = 0;
    const calc_array:number[]=[];

    for (const val of (Object.values(entities as {[index: string|number]: string|number}))) {
      const useval:string|number = val["attribute"] !== undefined ? this.getEntityAttr(val["entity_id"], val["attribute"]) : this.getEntityState(val["entity_id"]);
      calc_array.push(Number(useval));
    }

    switch (calcfunc) {
        case "max":
          calc = Math.max(...calc_array);
          break;

        case "min":
          calc = Math.min(...calc_array);
          break;

        case "mean":
          calc = this.math_mean(calc_array)
          break;

        case "sum":
          calc = this.math_sum(calc_array)
          break;
    }

    this.log("Calculated value " +calcfunc +"(" +calc_array.map(cval => cval) +") = " +calc);
    return calc;
  }

  log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  }

  getConfig(cvar) {
    try {
      const cvararray = cvar.split(".");
      let val;
      if (cvararray.length > 1 && cvararray[0]=="details" && this.config.details !== undefined) {
        val = this.config["details"][cvararray[1]];
      } else {
        val = this.config[cvar];
      }
      this.log(cvar +" --> " + val)
      return val;
    } catch (err) {
      return null;
    }
  }

  getEntityIcon(entity_id) {
    const entity = this.getEntity(entity_id);
    if (entity === undefined || entity === null || typeof entity !== 'object') {
        return cconst.DEFAULT_ICON;
    } else if ('icon' in entity.attributes && entity.attributes.icon !== '') {
        return entity.attributes['icon'];
    } else if ('device_class' in entity.attributes && entity.attributes['device_class'] !== undefined) {
        //TODO: Find better way to get deviceclass icons
          return cconst.DEVICECLASS_ICONS[entity.attributes['device_class']] || null;
    } else {
      return cconst.DEFAULT_ICON;
    }
  }

  getCollapsibleButton(button, deftext, deficon) {
    try {
      const btns = this.getConfig("details.collapsiblebuttons");
      return { text: this.loc(btns[button].text, 'common', this.brand), icon: btns[button].icon };
    } catch (err) {
      return { text: deftext, icon: deficon };
    }
  }

  round(value:number, decimals:number):string {
    return value.toPrecision(decimals);
  }

  math_sum(array:number[]) {
    let total = 0;
    for (let i=0; i<array.length; i++) {
      total += array[i];
    }
    return total;
  }

  math_mean(array:number[]) {
    return this.math_sum(array) / array.length;
  }

  getEntity(entity_id:string) {
    try {
      const entity = this.hass.states[entity_id];
      return entity !== undefined ? entity : null;
    } catch (err) {
      return null;
    }
  }

  getEntityState(entity_id:string) {
    try {
      const attr = this.hass.states[entity_id].state;
        return attr !== undefined ? attr : null;
    } catch (err) {
      return null;
    }
  }

  getEntityAttr(entity_id:string, attribute?:string) {
    if(attribute !== undefined){
      try {
        const attr = attribute === null ? this.hass.states[entity_id].attributes : this.hass.states[entity_id].attributes[attribute];
        return attr !== undefined ? attr : "null";
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  getEntityDeviceId(entity_id:string):string{
    return this.hass["entities"][entity_id].device_id;
  }

  createServiceData(service, isRequest, service_data, event) {
    if (service === undefined || service === null || service_data === undefined || service_data === null) {
      console.error("Trying to call an empty service or without service data - please check your card configuration.");
      this.hass.callService("persistent_notification", "create", { title: "No service", message: "No service defined for this action or no service data given." });
      return;
    }

    const event_val = event.target.getAttribute('value');
    // event_val = Number.isNaN(Number(event_val)) ? event_val : Number(event_val); //TODO is this neccessary?
    const service_data_mod = {};
    for (const [key, val] of Object.entries((service_data as {[index:string|number] :string}))) {
      service_data_mod[key] = val.replace(cconst.TEMPLATE_EDITOR.SERVICEVAL, event_val);
      service_data_mod[key] = val.replace(cconst.TEMPLATE_EDITOR.SERVICEVAL, event_val);
    }
    return this.callService(service, isRequest, service_data_mod)
  }

  callService(service, isRequest = true, service_data = {}) {
    this.log("CALLING SERVICE");
    this.log(service);
    this.log(service_data);


    if (service === undefined || service === null) {
      console.error("Trying to call an empty service - please check your card configuration.");
      this.hass.callService("persistent_notification", "create", { title: "No service", message: "No service defined for this action." });
    } else {
      service = service.split(".");
      this.hass.callService(service[0], service[1], service_data);
      if (isRequest) {
        // this.requestInProgress = true; //TODO: Removed, must be improved to check all sensors
        this.requestUpdate();
      }
    }
  }

  renderImage(state) {
    let compactview = '';
    if (this.compactView) {
      compactview = '-compact';
    }

    if (!this.image) {
      return html``;
    }
    return html`<div class='image'> <img
        class="charger${compactview}"
        src="${this.image}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      />${this.renderLeds(state)}
      </div>`;
  }


  renderLeds(state) {
    const visible = this.showLeds === true ? "visible" : "hidden";

    const carddatas = this.getCardData(this.getConfig("details.smartcharging"));
    let chargingmode = 'normal';
    if (carddatas !== null && carddatas !== undefined && typeof carddatas === 'object' && carddatas["entity"] !== null) {
      chargingmode = carddatas["entity"].state == 'on' ? 'smart' : 'normal';
    }
    const imageled = cconst.LEDIMAGES[chargingmode][state] || cconst.LEDIMAGES[chargingmode]['DEFAULT'];
    const compactview = this.compactView ? '-compact' : '';
    return html`<img class="charger led${compactview}" style="visibility:${visible}" src="${imageled}" @click="${() => this.handleMore(carddatas != null ? carddatas["entity"] : null)}"?more-info="true"/> `;
  }


  renderStats(state) {
    /* SHOW DATATABLE */
    if (!this.showStats) {
      return html``;
    }

    let compactview = this.compactView ? '-compact' : '';
    let stats;
    if (this.getConfig("details.stats") !== null) {
      stats = this.getCardData(this.getConfig("details.stats"));
      stats = stats !== undefined && stats !== null ? stats[state] || stats['default'] : [];
    } else {
      console.info("Stats is turned on but no stats given in config.")
      stats = {};
    }

    return html`
        <div class="stats${compactview}">
          ${(Object.values(stats != null?stats:[]) as cardEntity).map(stat=> {
            return html`
            <div
              class="stats-block"
              @click="${() => this.handleMore(stat["entity"])}"
              ?more-info="true"
            >
              <span class="stats-value">${this.loc(stat["useval"], "states") }</span>
              ${stat.unit_show ? stat.unit : ''}
              <div class="stats-subtitle">${this.loc(stat.text, 'common', this.brand)}</div>
            </div>
          </div>
          `;
        })
      }
      `;
    }


  renderName() {
    if (!this.showName) {
      return html``;
    }

    const carddata_name = this.getCardData(this.getConfig("details.name")); 
    const carddata_location = this.getCardData(this.getConfig("details.location"));
    let name;
    let location;
    let moreEntity = null;
    const compactview = this.compactView ? '-compact' : '';
    let nameunit, locationunit;

    if (carddata_name !== null && carddata_name !== undefined) {

      // name = typeof carddata_name == 'object' ? carddata_name["useval"] : carddata_name["text"];
      if(typeof carddata_name == 'object'){
        name = (carddata_name["useval"] !== undefined && carddata_name["useval"] !== null) ? carddata_name["useval"] : carddata_name["text"]
      }else{
        name = carddata_name;
      }
      moreEntity = typeof carddata_name == 'object' ? carddata_name["entity"] : null;
      nameunit = carddata_name["unit_show"] ? carddata_name["unit"] : ''
    }
    if (carddata_location !== null && carddata_location !== undefined) {
      if(typeof carddata_location == 'object'){
        location = (carddata_location["useval"] !== undefined && carddata_location["useval"] !== null) ? carddata_location["useval"] : carddata_location["text"]
      }else{
        location = carddata_location;
      }
      // location = typeof carddata_location == 'object' ? carddata_location["useval"] : carddata_location;
      locationunit = carddata_location["unit_show"] ? carddata_location["unit"] : ''
    }

    let combinator = "";
    if (name !== undefined && name !== null && location !== undefined && location !== null) {
      combinator = " - ";
    }

    return html`
      <div
        class="charger-name${compactview}"
        @click="${() => this.handleMore(moreEntity != null ? moreEntity : undefined)}"
        ?more-info="true"
      >
        ${name}${nameunit}${combinator}${location}${locationunit}
      </div>
    `;
  }


  renderStatus() {
    if (!this.showStatus) {
      return html``;
    }
    const carddata_status = this.getCardData(this.getConfig("details.status"));
    const carddata_substatus = this.getCardData(this.getConfig("details.substatus"));
    // let status =null, substatus=null;
    let status, substatus;
    const compactview = this.compactView ? '-compact' : '';
    let statusunit, substatusunit;

    if (carddata_status !== null && carddata_status !== undefined) {
      if(typeof carddata_status == 'object'){
        status = (carddata_status["useval"] !== undefined && carddata_status["useval"] !== null) ? carddata_status["useval"] : carddata_status["text"]
      }else{
        status = carddata_status;
      }
      // status = typeof carddata_status == 'object' ? carddata_status["useval"] : carddata_status;
      statusunit = carddata_status["unit_show"] ? carddata_status["unit"] : ''
    } else {
      status = this.entity != undefined ? this.entity["state"] : null;
    }

    if (carddata_substatus !== null && carddata_substatus !== undefined) {
      if(typeof carddata_substatus == 'object'){
        substatus = (carddata_substatus["useval"] !== undefined && carddata_substatus["useval"] !== null) ? carddata_substatus["useval"] : carddata_substatus["text"]
      }else{
        substatus = carddata_substatus;
      }
      // substatus = typeof carddata_substatus == 'object' ? carddata_substatus["useval"] : carddata_substatus;
      substatusunit = carddata_substatus["unit_show"] ? carddata_substatus["unit"] : '';
    }

    //Localize and choose
    if (this.statetext !== null && this.statetext !== undefined && typeof this.statetext === 'object' && status in this.statetext) {
      if (this.statetext[status].substring(0, 1) == "_") {  //Do not translate if leading _
        status = this.statetext[status].substring(1);
      } else {
        status = this.loc(this.statetext[status], "status", this.brand) || this.statetext[status];
      }
    } else {
      status = status !== null ? this.loc(status, "status", this.brand) || status : '';
    }

    substatus = substatus !== null ? this.loc(substatus, "substatus", this.brand) || substatus : '';
    // <ha-circular-progress .active=${this.requestInProgress} size="small"></ha-circular-progress>
    return html`
      <div class="status${compactview}" @click="${() => this.handleMore(carddata_status != null ? carddata_status["entity"] : null)}"?more-info="true">
        <span class="status-text${compactview}" alt=${status}>${status}${statusunit}</span>
        
        <div class="status-detail-text${compactview}" alt=${substatus} @click="${() => this.handleMore(carddata_substatus != null ? carddata_substatus["entity"] : null)}"?more-info="true">
          ${substatus}${substatusunit}
        </div>
      </div>
    `;
  }


  renderCollapsible(group, icon, tooltip, style, itemtype) {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }
    const carddatas = this.getCardData(this.getConfig("details." +group));
    return html`
      
        <input id="collapsible${style}" class="toggle${style}" type="checkbox" />
        <label for="collapsible${style}" class="lbl-toggle lbl-toggle${style}">
          <div class="tooltip-right">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="tooltiptext-right">${this.loc(tooltip)}</span>
          </div>
        </label>
        <div class="collapsible-content${style}">
          <div class="content-inner${style}">
          ${carddatas !== null ? (Object.values(carddatas) as cardEntity[]).map(carddata => {return this.renderCollapsibleItems(carddata, carddata["type"] || itemtype);}):localize('error.missing_group')}
            
          </div>
        </div>
      
    `;
  }

  renderCollapsibleItems(carddata, itemtype='') {
    if (carddata === null || carddata === undefined || typeof carddata !== 'object' || carddata.hide === true) {
      return html``;
    }
    if (itemtype === 'info' || itemtype === '' || itemtype === null) {
      return html`
        <div class="collapsible-item"
          @click="${() => this.handleMore(carddata.entity)}"
          ?more-info="true"
        >
          <div class="tooltip">
            <ha-icon icon="${carddata.icon}"></ha-icon>
            <br />${this.loc(carddata.useval, "states")} ${carddata.unit_show ? carddata.unit : ''}
            <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
          </div>
        </div>
      `;
    }else if (itemtype === 'service') {
        return html`
          <div class="collapsible-item"
            @click="${() => this.callService(carddata.service, true, carddata.service_data)}"
            ?more-info="true"
          >
            <div class="tooltip">
              <ha-icon icon="${carddata.icon}"></ha-icon>
              <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
              <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
            </div>
          </div>
        `;



} else if (itemtype === 'dropdown') {
        const sources = this.currentlimits;
        const selected = sources.indexOf(Number(carddata.useval));

        return html`
          <div class="collapsible-item">
          <ha-button-menu @click="${(e) => e.stopPropagation()}">
            <div slot="trigger">
                <div class="tooltip">
                  <ha-icon icon="${carddata.icon}"></ha-icon>
                  <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
                  <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" +carddata.unit +")" : ''}</span>
                </div>
            </div>
              <mwc-list>
              ${sources.map(
                (item, index) =>
                  html`<mwc-list-item
                    ?activated=${selected === index}
                    value=${item}
                    @click=${(event) => this.createServiceData(carddata.service, true, carddata.service_data, event)}
                  >
                    ${item}
                  </mwc-list-item>`
              )}
              </mwc-list>           
            </ha-button-menu>
          </div>
        `;
    } else {
      return html``;
    }
  }

  renderMainInfoLeftRight(data) {
    let carddatas;
    if (this.getConfig("details." +data) !== null) {
      carddatas = this.getCardData(this.getConfig("details." +data));
    } else {
      console.info("InfoLeftRight turned on but no stats given in config.")
      carddatas = {};
    } 
    const tooltip = data == 'info_right' ? '-right' : '';
    return html`
    ${carddatas !== null ? (Object.values(carddatas) as cardEntity[]).map(carddata => {
      return html`
      <div
      class='infoitems-item-${data}'
      @click='${() => this.handleMore(carddata.entity)}'      
      ?more-info='true'
    >
      <div class='tooltip'>
        <ha-icon icon=${data == 'info_left' ? carddata.icon :''}></ha-icon>
        ${this.loc(carddata.useval, "states")} ${carddata.unit_show ? carddata.unit : ''}
        <ha-icon icon=${data == 'info_right' ? carddata.icon :''}></ha-icon>
        <span class='tooltiptext${tooltip}'>${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? '(' +carddata.unit +')' : ''}</span>
      </div>
    </div>
    `
  }):''}`;
  }


  renderToolbar(state) {
    /* SHOW TOOLBAR */
    if (!this.showToolbar) {
      return html``;
    }

    let toolbardata_left; 
    if (this.getConfig("details.toolbar_left") !== undefined && this.getConfig("details.toolbar_left") !== null) {
      toolbardata_left = this.getCardData(this.getConfig("details.toolbar_left"));
      toolbardata_left = (toolbardata_left !== undefined && toolbardata_left !== null) ? toolbardata_left[state] || toolbardata_left['default'] : [];
    } else {
      console.info("Toolbar_left is turned on but not given in config.");
      // toolbardata_left = {};
    }

    let toolbardata_right;
    if (this.getConfig("details.toolbar_right") !== undefined && this.getConfig("details.toolbar_right") !== null) {
      toolbardata_right = this.getCardData(this.getConfig("details.toolbar_right"));
      toolbardata_right = (toolbardata_right !== undefined && toolbardata_right !== null) ? toolbardata_right[state] || toolbardata_right['default'] : [];
    } else {
      console.info("Toolbar_right is turned on but not given in config.");
      // toolbardata_right = {};
    }

    let toolbar_left;
    if(toolbardata_left !== undefined){
      toolbar_left = (Object.values(toolbardata_left) as cardEntity[]).map(btn => {
        return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
      }) 
    }else{
      toolbar_left = '';
    }

    let toolbar_right;
    if(toolbardata_right !== undefined){
        toolbar_right = (Object.values(toolbardata_right) as cardEntity[]).map(btn => {
        return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
      })
    }else{
      toolbar_right = '';
    }

    return html`
      <div class="toolbar">
        ${toolbar_left}
        <div class="fill-gap"></div>
        ${toolbar_right}
      </div>
    `;
  }

  renderToolbarButton(service, icon, text, service_data = {},isRequest = true) {
    const usetext = this.loc(text, this.brand) || text;
    if (text !== null && text !== undefined) {
      return html`
        <div class="tooltip">
          <ha-icon-button
            title="${this.loc(usetext, "common", this.brand)}"
            @click="${() => this.callService(service, isRequest, service_data)}"
            ><ha-icon icon="${icon}"></ha-icon
          ></ha-icon-button>
          <span class="tooltiptext">${this.loc(usetext, "common", this.brand)}</span>
        </div>
      `;
    } else {
      return html ``;
    }
  }

  renderCustomCardTheme() {
    switch (this.customCardTheme) {
      case 'theme_custom': {
        break;
      }
      case 'theme_default': {
        this.style.setProperty('--custom-card-background-color', '#03A9F4');
        this.style.setProperty('--custom-text-color', '#FFFFFF');
        this.style.setProperty('--custom-primary-color', '#03A9F4');
        this.style.setProperty('--custom-icon-color', '#FFFFFF');
        break;
      }
      case 'theme_transp_blue': {
        this.style.setProperty('--custom-card-background-color', 'transparent');
        this.style.setProperty('--custom-text-color', '#03A9F4');
        this.style.setProperty('--custom-primary-color', '#03A9F4');
        this.style.setProperty('--custom-icon-color', '#03A9F4');
        break;
      }
      case 'theme_transp_black': {
        this.style.setProperty('--custom-card-background-color', 'transparent');
        this.style.setProperty('--custom-text-color', 'black');
        this.style.setProperty('--custom-primary-color', 'black');
        this.style.setProperty('--custom-icon-color', 'black');
        break;
      }
      case 'theme_transp_white': {
        this.style.setProperty('--custom-card-background-color', 'transparent');
        this.style.setProperty('--custom-text-color', 'white');
        this.style.setProperty('--custom-primary-color', 'white');
        this.style.setProperty('--custom-icon-color', 'white');
        break;
      }
      case 'theme_lightgrey_blue': {
        this.style.setProperty('--custom-card-background-color', 'lightgrey');
        this.style.setProperty('--custom-text-color', '#03A9F4');
        this.style.setProperty('--custom-primary-color', '#03A9F4');
        this.style.setProperty('--custom-icon-color', '#03A9F4');
        break;
      }
      default: {
        this.style.setProperty('--custom-card-background-color', '#03A9F4');
        this.style.setProperty('--custom-text-color', '#FFFFFF');
        this.style.setProperty('--custom-primary-color', '#03A9F4');
        this.style.setProperty('--custom-icon-color', '#FFFFFF');
        break;
      }
    }
  }

  renderCompact() {
    const state = this.entity !== undefined ? this.entity["state"]:null;
    // let { state } = this.entity;

    return html`
      <ha-card>
        <div class="preview-compact">
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
          <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>
            ${this.renderStats(state)}
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }


  renderFull() {
    const state = this.entity !== undefined ? this.entity["state"]:null;
    const btn1 = this.getCollapsibleButton('group1', 'click_for_group1', 'mdi:speedometer');
    const btn2 = this.getCollapsibleButton('group2', 'click_for_group2', 'mdi:information');
    const btn3 = this.getCollapsibleButton('group3', 'click_for_group3', 'mdi:cog');
    return html`
      <ha-card>
        <div class="preview">
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
          <div class="infoitems-left">${this.renderMainInfoLeftRight('info_left')}</div>
            <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>

            ${this.renderCollapsible('group1', btn1.icon, btn1.text, '-lim','dropdown')}
            ${this.renderCollapsible('group2', btn2.icon, btn2.text, '-info','info')}
            ${this.renderCollapsible('group3', btn3.icon, btn3.text, '-cfg', 'info')}
            ${this.renderStats(state)}
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    this.renderCustomCardTheme();
    this.getEntityDeviceId(this.entity_id);
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    if (!this.config.entity) {
      return this._showError(localize('error.not_available'));
    }

    if (!this.entity) {
      return html`
        <ha-card
          .header=${this.config.name}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(this.config.hold_action),
            hasDoubleClick: hasAction(this.config.double_tap_action),
          })}
          tabindex="0"
          .label=${`Chargercard: ${this.config.entity || 'No Entity Defined'}`}
        ></ha-card>
      `;
    }
    
    if (this.compactView) {
      return this.renderCompact();
    } else {
      return this.renderFull();
    }


  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html` ${errorCard} `;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return styles;
  }
}

