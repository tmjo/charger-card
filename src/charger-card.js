import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import './charger-card-editor';
import localize from './localize';
import styles from './styles';
import * as cconst from './const';
// import * as easee from './const_easee.js';
// import * as template from './const_template.js';


class ChargerCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      requestInProgress: Boolean,
    };
  }
  static async getConfigElement() {
    return document.createElement('charger-card-editor');
  }

  static getStubConfig(hass, entities) {
    const [chargerEntity] = entities.filter(
      (eid) => eid.substr(0, eid.indexOf('.')) === 'sensor'
    );

    return {
      entity: chargerEntity || '',
      image: 'default',
    };
  }

  static get styles() {
    return styles;
  }

  get brand() {
    return this.config.brand;
  }

  get entity() {
    return this.hass.states[this.config.entity];
  }

  get image() {
    var image;
    if (this.config.customImage !== undefined && this.config.customImage !== null && this.config.customImage !== '') {
      // For images in www try path \local\image.png
      image = this.config.customImage;
    } else {
      var imageSel = this.config.chargerImage || cconst.DEFAULT_IMAGE;
      image = cconst.CHARGER_IMAGES.find(({ name }) => {
        if (name === imageSel) {
          return name;
        }
      }).img;
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
    if (this.config.currentlimits !== undefined && Array.isArray(this.config.currentlimits)) {
      return this.config.currentlimits;
    }
    console.log(Array.isArray(this.config.currentlimits))
    return cconst.DEFAULT_CURRENTLIMITS;
  }

  get statetext() {
    if (this.config.statetext !== undefined && typeof this.config.statetext == 'object') {
      return this.config.statetext;
    }
    return [{}];
  }

  get debug() {
    if (this.config) {
      return this.config.debug !== undefined ? this.config.debug : false;
    }
    return false;

  }



  getCardData(data) {
    var entities = {};

    if (data === undefined || data === null) {
      return null;
    } else if (typeof data == 'object' && Array.isArray(data)) {
        // ARRAYS OF ENTITY DATA
        for (let [key, val] of Object.entries(data)) {
          if (typeof val == 'object' && 'entity_id' in val) {
            entities[key] = this.getCardCheckData(val);
          }
      }
      return entities;
    } else if (typeof data == 'object' && 'entity_id' in data) {
        // SINGLE ENTITY DATA
        entities = this.getCardCheckData(data);
        return entities;

    } else if (typeof data == 'object'){
        // STATES DEPENDANT STUFF (STATS AND TOOLBAR)
        var stateobj = {};
        for (let [statekey, stateval] of Object.entries(data)) {
          var stateentities = {};
          for (let [key, val] of Object.entries(stateval)) {
            if (typeof val == 'object') {
              stateentities[key] = this.getCardCheckData(val);
            }
            stateobj[statekey] = stateentities;
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
    var data = {};

    //Set defaults if not given in config
    data['entity_id'] = val.entity_id !== undefined ? val.entity_id : null;
    data['unit'] = val.unit !== undefined ? val.unit : this.getEntityAttr(data.entity_id, 'unit_of_measurement');
    data['text'] = val.text !== undefined ? val.text : this.getEntityAttr(data.entity_id, 'friendly_name');
    data['icon'] = val.icon !== undefined ? val.icon : this.getEntityIcon(data.entity_id);
    data['unit_show'] = val.unit_show !== undefined ? val.unit_show : false;
    data['unit_showontext'] = val.unit_showontext !== undefined ? val.unit_showontext : false;
    data['round'] = val.round !== undefined ? val.round : false;
    data['type'] = val.type !== undefined ? val.type : 'info';
    data['attribute'] = val.attribute !== undefined ? val.attribute : null;
    data['useval'] = this.getEntityState(data.entity_id);
    data['service'] = val.service !== undefined ? val.service : null;
    data['service_data'] = val.service_data !== undefined ? val.service_data : null;
    data['type'] = val.type !== undefined ? val.type : null;
    data['conditional_entity'] = val.conditional_entity !== undefined ? val.conditional_entity : null;
    data['conditional_attribute'] = val.conditional_attribute !== undefined ? val.conditional_attribute : null;
    data['conditional_invert'] = val.conditional_invert !== undefined ? val.conditional_invert : null;

    // Get entity
    data['entity'] = this.getEntity(data.entity_id);

    // Use attribute if given in config
    if (data.entity !== null && data.attribute != null && data.attribute in data.entity.attributes) {
      data['useval'] = this.getEntityAttr(data.entity_id, data.attribute);
    }

    // Calculated entities
    if (data.entity_id == 'calculated') {
      data['calc_function'] = val.calc_function !== undefined ? val.calc_function : null;
      data['calc_entities'] = val.calc_entities !== undefined ? val.calc_entities : null;
      if (data.calc_function !== null && data.calc_entities !== null) {
        try {
          data.useval = this.getEntityCalcVal(data.calc_function, data.calc_entities);
        } catch (err) {
          console.error("The calculation you asked for didn't work, check your config (" +err +")");
        }
      }
    }

    //Apply rounding of number if specified, round to zero decimals if other than integer given (for instance true)
    if (data.round) {
      var decimals = Number.isInteger(data.round) ? data.round : 0;
      data.useval = this.round(data.useval, decimals);
    }

    // Conditional entities
    if (data.conditional_entity !== undefined && data.conditional_entity !== null) {
      data['hide'] = false;
      var cond_state, cond_attr;
      cond_state = this.getEntityState(data.conditional_entity);
      data['hide'] = cond_state !== null && (cond_state == 'off' || cond_state == 'false' || cond_state === false) ? true : data['hide'];
      if (data.conditional_attribute !== undefined && data.conditional_attribute !== null) {
        cond_attr = this.getEntityAttr(data.conditional_entity, data.conditional_attribute);
        data['hide'] = cond_attr !== null && (cond_attr == 'off' || cond_attr == 'false' || cond_attr === false) ? true : data['hide'];
      }

      if (data.conditional_invert === true) {
        data['hide'] = !data.hide;
      }

    }

    return data;
  }

  loc(string, group = '', brand = null, search = '', replace = '') {
    if (this.config.localize === undefined || this.config.localize == true) {
      group = group != '' ? group + "." : group;
      let debug = this.debug;
      return localize(group +string, brand, search, replace, debug);
    } else {
      return string;
    }
  }

  getEntityCalcVal(calcfunc, entities) {
    var calc;
    var calc_array = [];
    for (let [val] of Object.entries(entities)) {
      let useval = val.attribute !== undefined ? this.getEntityAttr(val.entity_id, val.attribute) : this.getEntityState(val.entity_id);
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
      return calc;
  }

  log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  }

  getEntityIcon(entity_id) {
    var entity = this.getEntity(entity_id);
    if (entity === undefined || entity === null || typeof entity !== 'object') {
        return cconst.DEFAULT_ICON;
    } else if ('icon' in entity.attributes && entity.attributes.icon !== '') {
        return entity.attributes['icon'];
    } else if ('device_class' in entity.attributes) {
        //TODO: Find better way to get deviceclass icons
        return cconst.DEVICECLASS_ICONS[entity.attributes['device_class']] || null;
    } else {
      return cconst.DEFAULT_ICON;
    }
  }

  getCollapsibleButton(button, deftext, deficon) {
    var btns = this.config.collapsiblebuttons;
    try {
      return { text: this.loc(btns[button].text, 'common', this.brand), icon: btns[button].icon };
    } catch (err) {
      return { text: deftext, icon: deficon };
    }
  }

  round(value, decimals) {
    try{
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    } catch (err){
      return value;
    }
  }

  math_sum(array) {
    var total = 0;
    for (var i=0; i<array.length; i++) {
      total += array[i];
    }
    return total;
  };

  math_mean(array) {
    return this.math_sum(array) / array.length;
  };

  getEntity(entity_id) {
    try {
      var entity = this.hass.states[entity_id];
      return entity !== undefined ? entity : null;
    } catch (err) {
      return null;
    }
  }

  getEntityState(entity_id) {
    try {
      var attr = this.hass.states[entity_id].state;
      return attr !== undefined ? attr : null;
    } catch (err) {
      return null;
    }
  }

  getEntityAttr(entity_id, attribute=null) {
    try {
      var attr = attribute === null ? this.hass.states[entity_id].attributes : this.hass.states[entity_id].attributes[attribute];
      return attr !== undefined ? attr : null;
    } catch (err) {
      return null;
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(localize('error.missing_entity'));
    }
    this.config = config;
  }

  getCardSize() {
    return 2;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps, true); //TODO: Probably not efficient to force update here?
  }

  updated(changedProps) {
    if (
      changedProps.get('hass') &&
      changedProps.get('hass').states[this.config.entity].state !==
      this.hass.states[this.config.entity].state
    ) {
      this.requestInProgress = false;
    }
  }

  handleMore(entity = this.entity) {
    fireEvent(
      this,
      'hass-more-info',
      {
        entityId: entity.entity_id,
      },
      {
        bubbles: true,
        composed: true,
      }
    );
  }

  createServiceData(service, isRequest, service_data, event) {
    var event_val = event.target.getAttribute('value');
    // event_val = Number.isNaN(Number(event_val)) ? event_val : Number(event_val); //TODO is this neccessary?
    var service_data_mod = {};
    for (let [key, val] of Object.entries(service_data)) {
      service_data_mod[key] = val.replace('_val_', event_val);
    }
    return this.callService(service, isRequest, service_data_mod)
  }

  callService(service, isRequest = true, service_data = {}) {
    // console.log(service);
    // console.log(service_data);

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
    var compactview = '';
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
    // if (!this.showLeds) {
    //   return html``;
    // }
    var hide = this.showLeds === true ? '' : '-hidden';

    var carddatas = this.getCardData(this.config["smartcharging"]);
    var chargingmode = 'normal';
    if (carddatas !== null && carddatas !== undefined && typeof carddatas === 'object' && carddatas.entity !== null) {
      chargingmode = carddatas.entity.state == 'on' ? 'smart' : 'normal';
    }
    var imageled = cconst.LEDIMAGES[chargingmode][state] || cconst.LEDIMAGES[chargingmode]['DEFAULT'];
    var compactview = this.compactView ? '-compact' : '';
    return html`<img class="charger led${hide}${compactview}" src="${imageled}" @click="${() => this.handleMore(carddatas.entity)}"?more-info="true"/> `;
  }

  renderStats(state) {
    /* SHOW DATATABLE */
    if (!this.showStats) {
      return html``;
    }
    // var compactview = this.compactView ? '-compact' : '';
    var stats;
    if (this.config['stats'] !== undefined && this.config['stats'] !== null) {
      stats = this.getCardData(this.config['stats']);
      stats = stats !== undefined && stats !== null ? stats[state] || stats['default'] : [];
    } else {
      console.info("Stats is turned on but no stats given in config.")
      stats = {};
    }
    return html`
      ${Object.values(stats).map(stat => {
            return html`
            <div
              class="stats-block"
              @click="${() => this.handleMore(stat.entity)}"
              ?more-info="true"
            >
              <span class="stats-value">${stat.useval}</span>
              ${stat.unit}
              <div class="stats-subtitle">${this.loc(stat.text, 'common', this.brand)}</div>
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

    var carddata_name = this.getCardData(this.config["name"]);
    var carddata_location = this.getCardData(this.config["location"]);
    var name;
    var location;
    var moreEntity = null;
    var compactview = this.compactView ? '-compact' : '';

    if (carddata_name !== null && carddata_name !== undefined) {
      name = typeof carddata_name == 'object' ? carddata_name.useval : carddata_name;
      moreEntity = typeof carddata_name == 'object' ? carddata_name.entity : null;
    }
    if (carddata_location !== null && carddata_location !== undefined) {
      location = typeof carddata_location == 'object' ? carddata_location.useval : carddata_location;
    }

    var combinator = "";
    if (name !== undefined && location !== undefined) {
      combinator = " - ";
    }

    return html`
      <div
        class="charger-name${compactview}"
        @click="${() => this.handleMore(moreEntity)}"
        ?more-info="true"
      >
        ${name}${combinator}${location}
      </div>
    `;
  }


  renderStatus() {
    if (!this.showStatus) {
      return html``;
    }
    var carddata_status = this.getCardData(this.config["status"]);
    var carddata_substatus = this.getCardData(this.config["substatus"]);
    var status =null, substatus=null;
    var compactview = this.compactView ? '-compact' : '';

    if (carddata_status !== null && carddata_status !== undefined) {
      status = typeof carddata_status == 'object' ? carddata_status.useval : carddata_status;
    } else {
      status = this.entity.state;
    }

    // console.log(carddata_substatus.useval)
    if (carddata_substatus !== null && carddata_substatus !== undefined) {
      substatus = typeof carddata_substatus == 'object' ? carddata_substatus.useval : carddata_substatus;
    }

    //Localize and choose
    status = status !== null ? this.loc(status, "status", this.brand) || this.statetext[status] || status : '';
    substatus = substatus !== null ? this.loc(substatus, "substatus", this.brand) || substatus : '';

    return html`
      <div class="status${compactview}" @click="${() => this.handleMore(carddata_status.entity || null)}"?more-info="true">
        <span class="status-text${compactview}" alt=${status}>${status}</span>
        <ha-circular-progress .active=${this.requestInProgress} size="small"></ha-circular-progress>
        <div class="status-detail-text${compactview}" alt=${substatus} @click="${() => this.handleMore(carddata_substatus.entity || null)}"?more-info="true">
          ${substatus}
        </div>
      </div>
    `;
  }


  renderCollapsible(group, icon, tooltip, style, itemtype) {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }
    var carddatas = this.getCardData(this.config[group]);
    return html`
      <div class="wrap-collabsible${style}">
        <input id="collapsible${style}" class="toggle${style}" type="checkbox" />
        <label for="collapsible${style}" class="lbl-toggle${style}">
          <div class="tooltip-right">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="tooltiptext-right">${this.loc(tooltip)}</span>
          </div>
        </label>
        <div class="collapsible-content${style}">
          <div class="content-inner${style}">
            ${carddatas !== null ? Object.values(carddatas).map(carddata => {return this.renderCollapsibleItems(carddata, carddata.type || itemtype);}):localize('error.missing_group')}
          </div>
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
            <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
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
        var selected = sources.indexOf(carddata.useval);
        return html`
          <paper-menu-button slot="dropdown-trigger" .noAnimations=${true} @click="${(e) => e.stopPropagation()}">
            <paper-button slot="dropdown-trigger">
              <div class="tooltip">
                <ha-icon icon="${carddata.icon}"></ha-icon>
                <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
                <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" +carddata.unit +")" : ''}</span>
              </div>
            </paper-button>
            <paper-listbox slot="dropdown-content" selected=${selected} @click="${(event) => this.createServiceData(carddata.service, true, carddata.service_data, event)}">
              ${sources.map((item) => html`<paper-item value=${item}>${item}</paper-item>`)}
            </paper-listbox>
          </paper-menu-button>
        `;
    } else {
      return html``;
    }
  }

  renderMainInfoLeftRight(data) {
    var carddatas = this.getCardData(this.config[data]);
    if (carddatas === null || carddatas === undefined || typeof carddatas !== 'object') {
      return html``;
    }

    var tooltip = data == 'info_right' ? '-right' : '';

    return html`
      ${carddatas !== null ? Object.values(carddatas).map(carddata => {
        return html`
        <div
        class='infoitems-item-${data}'
        @click='${() => this.handleMore(carddata.entity)}'
        ?more-info='true'
      >
        <div class='tooltip'>
          <ha-icon icon=${data == 'info_left' ? carddata.icon :''}></ha-icon>
          ${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
          <ha-icon icon=${data == 'info_right' ? carddata.icon :''}></ha-icon>
          <span class='tooltiptext${tooltip}'>${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? '(' +carddata.unit +')' : ''}</span>
        </div>
      </div>
      `
     }) : ''}
    `;
  }


  renderToolbar(state) {
    /* SHOW TOOLBAR */
    if (!this.showToolbar) {
      return html``;
    }

    var toolbardata_left = this.getCardData(this.config.toolbar_left);
    var toolbardata_right = this.getCardData(this.config.toolbar_right);
    toolbardata_left = toolbardata_left !== null ? toolbardata_left[state] || toolbardata_left.default || [] : [];
    toolbardata_right = toolbardata_right !== null ? toolbardata_right[state] || toolbardata_right.default || [] : [];

    var toolbar_left = Object.values(toolbardata_left).map(btn => {
      return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
    })

    var toolbar_right = Object.values(toolbardata_right).map(btn => {
      return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
    })

    return html`
      <div class="toolbar">
        ${toolbar_left}
        <div class="fill-gap"></div>
        ${toolbar_right}
      </div>
    `;
  }

  renderToolbarButton(service, icon, text, service_data = {},isRequest = true) {
    var usetext = this.loc(text, this.brand) || text;
    return html`
      <div class="tooltip">
        <ha-icon-button
          title="${this.loc(usetext,"common", this.brand)}"
          @click="${() => this.callService(service, isRequest, service_data)}"
          ><ha-icon icon="${icon}"></ha-icon
        ></ha-icon-button>
        <span class="tooltiptext">${this.loc(usetext,"common",  this.brand)}</span>
      </div>
    `;
  }

  renderCompact() {
    var { state } = this.entity;
    return html`
      <ha-card>
        <div class="preview-compact">
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
          <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>
          <div class="stats-compact">
            ${this.renderStats(state)}
          </div>
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  renderFull() {
    var { state } = this.entity;
    var btn1 = this.getCollapsibleButton('group1', 'click_for_group1', 'mdi:speedometer');
    var btn2 = this.getCollapsibleButton('group2', 'click_for_group2', 'mdi:information');
    var btn3 = this.getCollapsibleButton('group3', 'click_for_group3', 'mdi:cog');
    return html`
      <ha-card>
        <div class="preview">
          <div class="header">
            <div class="infoitems-left">${this.renderMainInfoLeftRight('info_left')}</div>
            <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>
          </div>
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
            ${this.renderCollapsible('group1', btn1.icon, btn1.text, '-lim','dropdown')}
            ${this.renderCollapsible('group2', btn2.icon, btn2.text, '-info','info')}
            ${this.renderCollapsible('group3', btn3.icon, btn3.text, '', 'info')}
            <div class="stats">
              ${this.renderStats(state)}
            </div>
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
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

  render() {
    this.renderCustomCardTheme();

    if (!this.entity) {
      return html`
        <ha-card>
          <div class="preview not-available">
            <div class="metadata">
              <div class="not-available">
                ${localize('error.not_available')}
              </div>
            <div>
          </div>
        </ha-card>
      `;
    }

    if (this.compactView) {
      return this.renderCompact();
    } else {
      return this.renderFull();
    }
  }
}

customElements.define('charger-card', ChargerCard);
console.info(
  `%cCHARGER-CARD ${cconst.VERSION} IS INSTALLED`,
  'color: green; font-weight: bold',
  ''
);

window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: 'charger-card',
  name: localize('common.name'),
  description: localize('common.description'),
});
