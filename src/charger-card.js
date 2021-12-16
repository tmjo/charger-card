import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import './charger-card-editor';
import localize from './localize';
import styles from './styles';
import * as cconst from './const';

// var easee = await import('./const_easee.js');
import * as easee from './const_easee.js';


// if (!customElements.get('ha-icon-button')) {
//   customElements.define(
//     'ha-icon-button',
//     class extends customElements.get('paper-icon-button') {}
//   );
// }

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

  get entity() {
    return this.hass.states[this.config.entity];
  }

  // get chargerId() {
  //   return this.hass.states[this.config.entity].attributes['id'];
  // }

  // get chargerDomain() {
  //   // if (this.config.domain === undefined) {
  //   return easee.DOMAIN;
  //   // }
  // }

  // get usedChargerLimit() {
  //   const {
  //     dynamicChargerCurrent,
  //     dynamicCircuitCurrent,
  //     maxChargerCurrent,
  //     maxCircuitCurrent,
  //   } = this.getEntities();
  //   const circuitRatedCurrent = this.hass.states[this.config.entity].attributes[
  //     'circuit_ratedCurrent'
  //   ];
  //   const usedChargerLimit = Math.min(
  //     this.getEntityState(dynamicChargerCurrent),
  //     this.getEntityState(dynamicCircuitCurrent),
  //     this.getEntityState(maxChargerCurrent),
  //     this.getEntityState(maxCircuitCurrent),
  //     circuitRatedCurrent
  //   );
  //   return usedChargerLimit;
  // }

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
    return cconst.DEFAULT_CURRENTLIMITS;
  }

  get statetext() {
    if (this.config.statetext !== undefined && typeof this.config.statetext == 'object') {
      return this.config.statetext;
    }
    return [{}];
  }


  getCardData(configgroup) {
    var entities = {};

    if (configgroup === undefined || configgroup === null) {
      return null;
    } else if (typeof configgroup == 'object' && Array.isArray(configgroup)) {
        // ARRAYS OF ENTITY DATA
        for (let [key, val] of Object.entries(configgroup)) {
          if (typeof val == 'object' && 'entity_id' in val) {
            entities[key] = this.getCardCheckData(val);
          }
      }
      return entities;
    } else if (typeof configgroup == 'object' && 'entity_id' in configgroup) {
        // SINGLE ENTITY DATA
        entities = this.getCardCheckData(configgroup);
        return entities;

    } else if (typeof configgroup == 'object'){
        // STATES DEPENDANT STUFF (STATS AND TOOLBAR)
        var stateobj = {};
        for (let [statekey, stateval] of Object.entries(configgroup)) {
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
      entities = configgroup;
    }
    // console.log(entities);
    return entities;
  }

  getCardCheckData(val) {
    // Get entity
    var entityinfo = {};

    //Set defaults if not given in config
    entityinfo['entity_id'] = val.entity_id !== undefined ? val.entity_id : null;
    entityinfo['unit'] = val.unit !== undefined ? val.entity_id : this.getEntityAttr(entityinfo.entity_id, 'unit_of_measurement');
    entityinfo['text'] = val.text !== undefined ? val.text : this.getEntityAttr(entityinfo.entity_id, 'friendly_name');
    entityinfo['icon'] = val.icon !== undefined ? val.icon : this.getEntityIcon(entityinfo.entity_id);
    entityinfo['unit_show'] = val.unit_show !== undefined ? val.unit_show : false;
    entityinfo['unit_showontext'] = val.unit_showontext !== undefined ? val.unit_showontext : false;
    entityinfo['round'] = val.round !== undefined ? val.round : false;
    entityinfo['type'] = val.type !== undefined ? val.type : 'info';
    entityinfo['attribute'] = val.attribute !== undefined ? val.attribute : null;
    entityinfo['useval'] = this.getEntityState(entityinfo.entity_id);
    entityinfo['service'] = val.service !== undefined ? val.service : null;
    // service_data

    // Get entity
    entityinfo['entity'] = this.getEntity(entityinfo.entity_id);

    // Use attribute if given in config
    if (entityinfo.entity !== null && entityinfo.attribute != null && entityinfo.attribute in entityinfo.entity.attributes) {
      entityinfo['useval'] = this.getEntityAttr(entityinfo.entity_id, entityinfo.attribute);
    }

    //Apply rounding of number if specified, round to zero decimals if other than integer given (for instance true)
    if (entityinfo.round) {
      var decimals = Number.isInteger(entityinfo.round) ? entityinfo.round : 0;
      entityinfo.useval = this.round(entityinfo.useval, decimals);
    }
    // return Object.assign(entityinfo, val);
    return entityinfo;
  }

  getEntityIcon(entity_id) {
    var entity = this.getEntity(entity_id);
    if (entity === undefined || entity === null || typeof entity !== 'object') {
        return null;
    } else if ('icon' in entity.attributes) {
        return entity.attributes['icon'];
    } else if ('device_class' in entity.attributes) {
        //TODO: Find better way to get deviceclass icons
        return cconst.DEVICECLASS_ICONS[entity.attributes['device_class']] || null;
    }
    return null;
  }

  getCollapsibleButton(button, deftext, deficon) {
    var btns = this.config.collapsiblebuttons;
    try {
      return { text: btns[button].text, icon: btns[button].icon };
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

  getEntity(entity_id) {
    try {
      return this.hass.states[entity_id];
    } catch (err) {
      return null;
    }
  }

  getEntityState(entity_id) {
    try {
      return this.hass.states[entity_id].state;
    } catch (err) {
      return null;
    }
  }

  getEntityAttr(entity_id, attribute=null) {
    try {
      var attr = attribute === null ? this.hass.states[entity_id].attributes : this.hass.states[entity_id].attributes[attribute];
      return attr;
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

  setServiceData(service, isRequest, e) {
    switch (service) {
      case easee.SERVICES.chargerMaxCurrent: {
        const current = e.target.getAttribute('value');
        return this.callService(service, isRequest, { current });
      }
      case easee.SERVICES.chargerDynCurrent: {
        const current = e.target.getAttribute('value');
        return this.callService(service, isRequest, { current });
      }
      case easee.SERVICES.circuitOfflineCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
      case easee.SERVICES.circuitMaxCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
      case easee.SERVICES.circuitDynCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
    }
  }

  callService(service, isRequest = true, servicedata = {}, domain = null) {
    if (service === undefined || service === null) {
      console.error("Trying to call an empty service - please check your card configuration.");
      this.hass.callService("persistent_notification", "create", { title: "No service", message: "No service defined for this action." });
    } else {
      service = service.split(".");
      // console.log(service[0])
      // console.log(service[1])
      // console.log(servicedata)
      this.hass.callService(service[0], service[1], servicedata[0]);
      // this.hass.callService(service[0], service[1], {
      //   charger_id: this.chargerId,
      //   ...options,
      // });
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
    return html` <img
        class="charger${compactview}"
        src="${this.image}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      />${this.renderLeds(state)}`;
  }

  renderLeds(state) {
    if (!this.showLeds) {
      return html``;
    }
    var carddatas = this.getCardData(this.config["smartcharging"]);
    var chargingmode = 'normal';
    if (carddatas !== null && carddatas !== undefined && typeof carddatas === 'object') {
      chargingmode = carddatas.entity.state == 'on' ? 'smart' : 'normal';
    }
    var imageled = easee.LEDIMAGES[chargingmode][state] || easee.LEDIMAGES[chargingmode]['DEFAULT'];
    var compactview = this.compactView ? '-compact' : '';
    return html`<img class="charger led${compactview}" src="${imageled}" @click="${() => this.handleMore(carddatas.entity)}"?more-info="true"/> `;
  }

  renderStats(state) {
    /* SHOW DATATABLE */
    if (!this.showStats) {
      return html``;
    }
    var compactview = this.compactView ? '-compact' : '';
    var stats;
    if (this.config['stats'] !== undefined && this.config['stats'] !== null) {
      stats = this.getCardData(this.config['stats']);
      stats = stats !== undefined && stats !== null ? stats[state] || stats['default'] : [];
    } else {
      console.info("Stats is turned on but no stats given in config.")
      stats = {};
    }
    return html`<div class="stats${compactview}">
      ${Object.values(stats).map(stat => {
            return html`
            <div
              class="stats-block"
              @click="${() => this.handleMore(stat.entity)}"
              ?more-info="true"
            >
              <span class="stats-value">${stat.useval}</span>
              ${stat.unit}
              <div class="stats-subtitle">${stat.text}</div>
            </div>
          `;
        })
      }
      </div>`;
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
    if (carddata_substatus !== null && carddata_substatus !== undefined) {
      substatus = typeof carddata_substatus == 'object' ? carddata_substatus.useval : carddata_substatus;
    }

    //Localize
    status = status !== null ? this.statetext[status] || localize("status." + status) || status : '';
    substatus = substatus !== null ? localize("substatus." + substatus) || substatus :'';

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
    // TODO: CONDITIONAL SHOWING OF UPDATEAVAILABLE ETC, INCLUDING SERVICE CALLS AND USED LIMIT (CALCVAL)
    // var updateAvailableState = this.getEntityState(updateAvailable) || 'off';

    // ${this.renderCollapsibleDropDownItems(
    //   maxChargerCurrent,
    //   easee.SERVICES.chargerMaxCurrent,
    //   'Max Charger',
    //   undefined,
    //   'Max Charger Limit',
    //   true
    // )}

    var carddatas = this.getCardData(this.config[group]);
    return html`
      <div class="wrap-collabsible${style}">
        <input id="collapsible${style}" class="toggle${style}" type="checkbox" />
        <label for="collapsible${style}" class="lbl-toggle${style}">
          <div class="tooltip-right">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="tooltiptext-right">${localize(tooltip)}</span>
          </div>
        </label>
        <div class="collapsible-content${style}">
          <div class="content-inner${style}">
            ${carddatas !== null ? Object.values(carddatas).map(carddata => {return this.renderCollapsibleItems(carddata, itemtype);}):localize('error.missing_group')}
          </div>
        </div>
      </div>
    `;
  }

  renderCollapsibleItems(carddata, itemtype='') {
    if (carddata === null || carddata === undefined || typeof carddata !== 'object') {
      return html``;
    }

    if (itemtype === '' || itemtype === 'info') {
      var options = "";
      return html`
        <div class="collapsible-item"
          @click="${() => this.handleMore(carddata.entity)}"
          ?more-info="true"
        >
          <div class="tooltip">
            <ha-icon icon="${carddata.icon}"></ha-icon>
            <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
            <span class="tooltiptext">${carddata.text} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
          </div>
        </div>
      `;
    }else if (itemtype === 'service') {
        var options = "";
        return html`
          <div class="collapsible-item"
            @click="${() => this.callService(carddata.service, true, carddata.service_data)}"
            ?more-info="true"
          >
            <div class="tooltip">
              <ha-icon icon="${carddata.icon}"></ha-icon>
              <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
              <span class="tooltiptext">${carddata.text} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
            </div>
          </div>
        `;

    } else if (itemtype === 'dropdown') {
        const sources = cconst.DEFAULT_CURRENTLIMITS;
        var selected = sources.indexOf(carddata.useval);
        return html`
          <paper-menu-button slot="dropdown-trigger" .noAnimations=${true} @click="${(e) => e.stopPropagation()}">
            <paper-button slot="dropdown-trigger">
              <div class="tooltip">
                <ha-icon icon="${carddata.icon}"></ha-icon>
                <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
                <span class="tooltiptext">${carddata.text} ${carddata.unit_showontext ? "(" +carddata.unit +")" : ''}</span>
              </div>
            </paper-button>
            <paper-listbox slot="dropdown-content" selected=${selected} @click="${(e) => this.setServiceData(carddata.service, true, e)}">
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

    return html`
      ${carddatas !== null ? Object.values(carddatas).map(carddata => {
        return html`
        <div
        class='infoitems-item'
        @click='${() => this.handleMore(carddata.entity)}'
        ?more-info='true'
      >
        <div class='tooltip'>
          <ha-icon icon='${carddata.icon}'></ha-icon>
          ${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
          <span class='tooltiptext'>${carddata.text} ${carddata.unit_showontext ? '(' +carddata.unit +')' : ''}</span>
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
      console.log(btn)
      return this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data)
    })

    var toolbar_right = Object.values(toolbardata_right).map(btn => {
      return this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data)
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
    var useText = '';
    try {
      useText = localize(text);
    } catch (e) {
      useText = text;
    }
    return html`
      <div class="tooltip">
        <ha-icon-button
          title="${useText}"
          @click="${() => this.callService(service, isRequest, service_data)}"
          ><ha-icon icon="${icon}"></ha-icon
        ></ha-icon-button>
        <span class="tooltiptext">${useText}</span>
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
          ${this.renderStats(state)}
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  renderFull() {
    var { state } = this.entity;
    var btn1 = this.getCollapsibleButton('group1', 'common.click_for_limits', 'mdi:speedometer');
    var btn2 = this.getCollapsibleButton('group2', 'common.click_for_info', 'mdi:information');
    var btn3 = this.getCollapsibleButton('group3', 'common.click_for_config', 'mdi:cog');
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
            ${this.renderStats(state)}
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
                ${localize('common.not_available')}
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
