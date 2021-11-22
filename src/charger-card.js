import { LitElement, html } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import './charger-card-editor';
import localize from './localize';
import styles from './styles';
import * as cconst from './const';

if (!customElements.get('ha-icon-button')) {
  customElements.define(
    'ha-icon-button',
    class extends customElements.get('paper-icon-button') {}
  );
}

class ChargerCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      requestInProgress: Boolean,
    };
  }

  static get styles() {
    return styles;
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

  get entity() {
    return this.hass.states[this.config.entity];
  }

  get chargerId() {
    return this.hass.states[this.config.entity].attributes['id'];
  }

  get chargerDomain() {
    // if (this.config.domain === undefined) {
    return cconst.EASEE_DOMAIN;
    // }
  }

  get usedChargerLimit() {
    const {
      dynamicChargerCurrent,
      dynamicCircuitCurrent,
      maxChargerCurrent,
      maxCircuitCurrent,
    } = this.getEntities();
    const circuitRatedCurrent = this.hass.states[this.config.entity].attributes[
      'circuit_ratedCurrent'
    ];
    const usedChargerLimit = Math.min(
      this.getEntityState(dynamicChargerCurrent),
      this.getEntityState(dynamicCircuitCurrent),
      this.getEntityState(maxChargerCurrent),
      this.getEntityState(maxCircuitCurrent),
      circuitRatedCurrent
    );
    return usedChargerLimit;
  }

  get image() {
    let imgselected = this.config.chargerImage || cconst.DEFAULTIMAGE;

    const chargerImage = cconst.CHARGER_IMAGES.find(({ name }) => {
      if (name === imgselected) {
        return name;
      }
    });

    if (
      this.config.customImage === undefined ||
      this.config.customImage === ''
    ) {
      try {
        return chargerImage.img;
      } catch (err) {
        return null;
      }
    }
    return this.config.customImage;
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
  get useStatsDefault() {
    if (this.config.stats === undefined) {
      return true;
    }
    return false;
  }

  get entityBasename() {
    return this.config.entity
      .split('.')[1]
      .replace(cconst.EASEE_MAIN_ENTITY_BASE, '');
  }

  getEntityBase(entity_id) {
    for (let c in this.config) {
      // console.log("config: " +c)
      if (this.config[c] === entity_id) {
        return c
      }

    }
  }

  getEntities() {
    const cableLocked = this.getEntity(this.config.cableLocked);
    const cableLockedPermanently = this.getEntity(
      this.config.cableLockedPermanently
    );
    const basicSchedule = this.getEntity(this.config.basicSchedule);
    const circuitCurrent = this.getEntity(this.config.circuitCurrent);
    const costPerKwh = this.getEntity(this.config.costPerKwh);
    const dynamicChargerCurrent = this.getEntity(
      this.config.dynamicChargerCurrent
    );
    const dynamicCircuitCurrent = this.getEntity(
      this.config.dynamicCircuitCurrent
    );
    const enableIdleCurrent = this.getEntity(this.config.enableIdleCurrent);
    const offlineCircuitCurrent = this.getEntity(
      this.config.offlineCircuitCurrent
    );
    const inCurrent = this.getEntity(this.config.inCurrent);
    const isEnabled = this.getEntity(this.config.isEnabled);
    const maxChargerCurrent = this.getEntity(this.config.maxChargerCurrent);
    const maxCircuitCurrent = this.getEntity(this.config.maxCircuitCurrent);
    const isOnline = this.getEntity(this.config.isOnline);
    const outputCurrent = this.getEntity(this.config.outputCurrent);
    const reasonForNoCurrent = this.getEntity(
      this.config.reasonForNoCurrent
    );
    const sessionEnergy = this.getEntity(this.config.sessionEnergy);
    const energyPerHour = this.getEntity(this.config.energyPerHour);
    const energyLifetime = this.getEntity(this.config.energyLifetime);
    const smartCharging = this.getEntity(this.config.smartCharging);
    const totalPower = this.getEntity(this.config.totalPower);
    const updateAvailable = this.getEntity(this.config.updateAvailable);
    const voltage = this.getEntity(this.config.voltage);
    const status = this.entity;

    return {
      cableLocked,
      cableLockedPermanently,
      basicSchedule,
      circuitCurrent,
      costPerKwh,
      dynamicChargerCurrent,
      dynamicCircuitCurrent,
      enableIdleCurrent,
      offlineCircuitCurrent,
      inCurrent,
      isEnabled,
      maxChargerCurrent,
      maxCircuitCurrent,
      isOnline,
      outputCurrent,
      reasonForNoCurrent,
      sessionEnergy,
      energyPerHour,
      energyLifetime,
      smartCharging,
      totalPower,
      updateAvailable,
      voltage,
      status,
    };
  }

  getEntity(entity_name) {
    try {
      return this.hass.states[entity_name];
    } catch (err) {
      return null;
    }
  }

  getEntityState(entity) {
    try {
      return entity.state;
    } catch (err) {
      return null;
    }
  }

  getEntityAttribute(entity_name, attribute) {
    try {
      return this.hass.states[entity_name].attributes[attribute];
    } catch (err) {
      return null;
    }
  }

  getEntityAttributes(entity_name) {
    try {
      return this.hass.states[entity_name].attributes;
    } catch (err) {
      return null;
    }
  }

  getStatsDefault(state) {
    switch (state) {
      case cconst.EASEE_CHARGERSTATUS.STANDBY_1: {
        return [
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: localize('charger_status.sessionEnergy'),
          },
          {
            calcValue: this.usedChargerLimit,
            unit: 'A',
            subtitle: 'Current Limit',
          },
          {
            entity_id: (this.config.cableLockedPermanently),
            unit: '',
            subtitle: 'Permanently Locked',
          },
        ];
      }
      case cconst.EASEE_CHARGERSTATUS.PAUSED_2: {
        return [
          {
            calcValue: this.usedChargerLimit,
            unit: 'A',
            subtitle: 'Current Limit',
          },
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: localize('charger_status.sessionEnergy'),
          },
          {
            entity_id: (this.config.basicSchedule),
            unit: '',
            subtitle: 'Schedule',
          },
          {
            entity_id: (this.config.smartCharging),
            unit: '',
            subtitle: 'Smart Charging',
          },
        ];
      }
      case cconst.EASEE_CHARGERSTATUS.CHARGING_3: {
        return [
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: 'Energy',
          },
          {
            entity_id: (this.config.energyPerHour),
            unit: 'kWh/h',
            subtitle: 'Rate',
          },
          {
            entity_id: (this.config.circuitCurrent),
            unit: 'A',
            subtitle: 'Circuit',
          },
          {
            entity_id: (this.config.outputCurrent),
            unit: 'A',
            subtitle: 'Allowed',
          },
          {
            entity_id: (this.config.inCurrent),
            unit: 'A',
            subtitle: 'Actual',
          },
          {
            entity_id: (this.config.totalPower),
            unit: 'kW',
            subtitle: 'Power',
          },
        ];
      }
      case cconst.EASEE_CHARGERSTATUS.READY_4: {
        return [
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: localize('charger_status.sessionEnergy'),
          },
          {
            calcValue: this.usedChargerLimit,
            unit: 'A',
            subtitle: 'Current Limit',
          },
          {
            entity_id: (this.config.basicSchedule),
            unit: '',
            subtitle: 'Schedule',
          },
        ];
      }
      case cconst.EASEE_CHARGERSTATUS.ERROR_5: {
        return [
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: localize('charger_status.sessionEnergy'),
          },
          {
            calcValue: this.usedChargerLimit,
            unit: 'A',
            subtitle: 'Current Limit',
          },
        ];
      }
      case cconst.EASEE_CHARGERSTATUS.CONNECTED_6: {
        return [
          {
            entity_id: (this.config.sessionEnergy),
            unit: 'kWh',
            subtitle: localize('charger_status.sessionEnergy'),
          },
          {
            calcValue: this.usedChargerLimit,
            unit: 'A',
            subtitle: 'Current Limit',
          },
          {
            entity_id: (this.config.basicSchedule),
            unit: '',
            subtitle: 'Schedule',
          },
        ];
      }
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
      case cconst.EASEE_SERVICES.chargerMaxCurrent: {
        const current = e.target.getAttribute('value');
        return this.callService(service, isRequest, { current });
      }
      case cconst.EASEE_SERVICES.chargerDynCurrent: {
        const current = e.target.getAttribute('value');
        return this.callService(service, isRequest, { current });
      }
      case cconst.EASEE_SERVICES.circuitOfflineCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
      case cconst.EASEE_SERVICES.circuitMaxCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
      case cconst.EASEE_SERVICES.circuitDynCurrent: {
        const currentP1 = e.target.getAttribute('value');
        return this.callService(service, isRequest, { currentP1 });
      }
    }
  }

  callService(service, isRequest = true, options = {}) {
    this.hass.callService(this.chargerDomain, service, {
      charger_id: this.chargerId,
      ...options,
    });

    if (isRequest) {
      // this.requestInProgress = true; //TODO: Removed, must be improved to check all sensors
      this.requestUpdate();
    }
  }

  getAttributes(entity) {
    const {
      status,
      state,
      friendly_name,
      name,
      site_name,
      icon,
    } = entity.attributes;

    return {
      status: status || state,
      friendly_name,
      name,
      site_name,
      icon,
    };
  }

  imageLed(state, smartCharging) {
    let chargingMode = 'normal';
    if (smartCharging == 'on') {
      chargingMode = 'smart';
    }
    return (
      cconst.EASEE_LEDIMAGES[chargingMode][state] ||
      cconst.EASEE_LEDIMAGES[chargingMode]['DEFAULT']
    );
  }

  renderImage(state) {
    let compactview = '';
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
    if (this.showLeds) {
      let compactview = '';
      if (this.compactView) {
        compactview = '-compact';
      }

      const smartCharging = this.getEntityState(
        this.getEntity(this.config.smartCharging)
      );
      return html`<img
        class="charger led${compactview}"
        src="${this.imageLed(state, smartCharging)}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      /> `;
    }
    return html``;
  }

  renderStats(state) {
    /* SHOW DATATABLE */
    if (!this.showStats) {
      return html``;
    }
    let compactview = '';
    if (this.compactView) {
      compactview = '-compact';
    }

    /* DEFAULT DATATABLE */
    if (this.useStatsDefault) {
      const statsList = this.getStatsDefault(state) || [];
      return html`<div class="stats${compactview}">
        ${this.renderStatsList(state, statsList)}
      </div>`;
      /* CUSTOM DATATABLE */
    } else {
      const { stats = {} } = this.config;
      const statsList = stats[state] || stats.default || [];
      return html`<div class="stats${compactview}">
        ${this.renderStatsList(state, statsList)}
      </div>`;
    }
  }

  renderStatsList(state, statsList) {
    return statsList.map(
      ({ entity_id, attribute, calcValue, unit, subtitle }) => {
        if (!entity_id && !attribute && !calcValue) {
          return html``;
        } else if (calcValue) {
          return this.renderStatsHtml(calcValue, unit, subtitle);
        }
        this.getEntity();
        try {
          const value = attribute
            ? this.hass.states[entity_id].attributes[attribute]
            : this.hass.states[entity_id].state;
          return this.renderStatsHtml(
            value,
            unit,
            subtitle,
            this.hass.states[entity_id]
          );
        } catch (err) {
          return null;
        }
      }
    );
  }

  renderStatsHtml(value, unit, subtitle, entity = this.entity) {
    return html`
      <div
        class="stats-block"
        @click="${() => this.handleMore(entity)}"
        ?more-info="true"
      >
        <span class="stats-value">${value}</span>
        ${unit}
        <div class="stats-subtitle">${subtitle}</div>
      </div>
    `;
  }

  renderName() {
    const { name, site_name } = this.getAttributes(this.entity);
    if (!this.showName) {
      return html``;
    }

    let compactview = '';
    if (this.compactView) {
      compactview = '-compact';
    }

    return html`
      <div
        class="charger-name${compactview}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      >
        ${site_name} - ${name}
      </div>
    `;
  }

  renderStatus() {
    if (!this.showStatus) {
      return html``;
    }

    let compactview = '';
    if (this.compactView) {
      compactview = '-compact';
    }

    const { state } = this.entity;
    const { reasonForNoCurrent } = this.getEntities();
    const localizedStatus = localize(`status.${state}`) || state;
    let subStatusText =
      localize(
        `charger_substatus.${this.getEntityState(reasonForNoCurrent)}`
      ) || this.getEntityState(reasonForNoCurrent);

    return html`
      <div
        class="status${compactview}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      >
        <span class="status-text${compactview}" alt=${localizedStatus}>
          ${localizedStatus}
        </span>
        <ha-circular-progress
          .active=${this.requestInProgress}
          size="small"
        ></ha-circular-progress>
        <div
          class="status-detail-text${compactview}"
          alt=${subStatusText}
          @click="${() => this.handleMore(reasonForNoCurrent)}"
          ?more-info="true"
        >
          ${subStatusText}
        </div>
      </div>
    `;
  }

  renderCollapsibleConfig() {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }

    const {
      cableLocked,
      cableLockedPermanently,
      enableIdleCurrent,
      isEnabled,
      smartCharging,
      updateAvailable,
      costPerKwh,
    } = this.getEntities();
    let updateAvailableState = this.getEntityState(updateAvailable) || 'off';
    let localizedClickForConfig = localize('common.click_for_config');

    return html`
      <div class="wrap-collabsible">
        <input id="collapsible" class="toggle" type="checkbox" />
        <label for="collapsible" class="lbl-toggle">
          <div class="tooltip-right">
            <ha-icon icon="mdi:cog"></ha-icon>
            <span class="tooltiptext-right">${localizedClickForConfig}</span>
          </div>
        </label>
        <div class="collapsible-content">
          <div class="content-inner">
            ${this.renderCollapsibleItems(isEnabled, 'Enabled')}
            ${this.renderCollapsibleItems(enableIdleCurrent, 'Idle Current')}
            ${this.renderCollapsibleItems(
              cableLockedPermanently,
              'Permanently Locked'
            )}
            ${this.renderCollapsibleItems(cableLocked, 'Locked')}
            ${this.renderCollapsibleItems(smartCharging, 'Smart Charging')}
            ${this.renderCollapsibleItems(costPerKwh, 'Energy cost')}
            ${this.renderCollapsibleItems(updateAvailable, 'Update Available')}
            ${updateAvailableState === 'on' &&
            this.entity.state === cconst.EASEE_CHARGERSTATUS.STANDBY_1
              ? this.renderCollapsibleServiceItems(
                  undefined,
                  'update_firmware',
                  'Update',
                  'mdi:file-download',
                  'Update Firmware'
                )
              : ''}
            ${updateAvailableState === 'on' &&
            this.entity.state === cconst.EASEE_CHARGERSTATUS.STANDBY_1
              ? this.renderCollapsibleServiceItems(
                  undefined,
                  'reboot',
                  'Reboot',
                  'mdi:restart',
                  'Reboot'
                )
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderCollapsibleInfo() {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }

    const {
      isOnline,
      voltage,
      totalPower,
      circuitCurrent,
      inCurrent,
      sessionEnergy,
      energyPerHour,
      energyLifetime,
    } = this.getEntities();

    let localizedClickForStatus = localize('common.click_for_info');

    return html`
      <div class="wrap-collabsible-info">
        <input id="collapsible-info" class="toggle-info" type="checkbox" />
        <label for="collapsible-info" class="lbl-toggle-info">
          <div class="tooltip-right">
            <ha-icon icon="mdi:information"></ha-icon>
            <span class="tooltiptext-right">${localizedClickForStatus}</span>
          </div>
        </label>
        <div class="collapsible-content-info">
          <div class="content-inner-info">
            ${this.renderCollapsibleItems(isOnline, localize('common.online'))}
            ${this.renderCollapsibleItems(
              voltage,
              localize('common.voltage'),
              true
            )}
            ${this.renderCollapsibleItems(totalPower, localize('common.power'))}
            ${this.renderCollapsibleItems(
              inCurrent,
              localize('common.charger_current'),
              true
            )}
            ${this.renderCollapsibleItems(
              circuitCurrent,
              localize('common.circuit_current'),
              true
            )}
            ${this.renderCollapsibleItems(
              energyPerHour,
              localize('common.energy_per_hour')
            )}
            ${this.renderCollapsibleItems(
              sessionEnergy,
              localize('charger_status.sessionEnergy')
            )}
            ${this.renderCollapsibleItems(
              energyLifetime,
              localize('common.lifetime_energy'),
              true
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderCollapsibleLimits() {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }

    const {
      maxChargerCurrent,
      maxCircuitCurrent,
      dynamicChargerCurrent,
      dynamicCircuitCurrent,
      offlineCircuitCurrent,
    } = this.getEntities();
    let localizedClickForLimits = localize('common.click_for_limits');

    return html`
      <div class="wrap-collabsible-lim">
        <input id="collapsible-lim" class="toggle-lim" type="checkbox" />
        <label for="collapsible-lim" class="lbl-toggle-lim">
          <div class="tooltip-right">
            <ha-icon icon="mdi:speedometer"></ha-icon>
            <span class="tooltiptext-right">${localizedClickForLimits}</span>
          </div>
        </label>
        <div class="collapsible-content-lim">
          <div class="content-inner-lim">
            ${this.renderCollapsibleDropDownItems(
              maxChargerCurrent,
              cconst.EASEE_SERVICES.chargerMaxCurrent,
              'Max Charger',
              undefined,
              'Max Charger Limit',
              true
            )}
            ${this.renderCollapsibleDropDownItems(
              dynamicChargerCurrent,
              cconst.EASEE_SERVICES.chargerDynCurrent,
              'Dyn Charger',
              undefined,
              'Dyn Charger Limit',
              true
            )}
            ${this.renderCollapsibleDropDownItems(
              maxCircuitCurrent,
              cconst.EASEE_SERVICES.circuitMaxCurrent,
              'Max Circuit',
              undefined,
              'Max Circuit Limit',
              true
            )}
            ${this.renderCollapsibleDropDownItems(
              dynamicCircuitCurrent,
              cconst.EASEE_SERVICES.circuitDynCurrent,
              'Dyn Circuit',
              undefined,
              'Dyn Circuit Limit',
              true
            )}
            ${this.renderCollapsibleDropDownItems(
              offlineCircuitCurrent,
              cconst.EASEE_SERVICES.circuitOfflineCurrent,
              'Off Lim',
              undefined,
              'Offline Limit',
              true
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderCollapsibleItems(entity, tooltip, round = false) {
    if (entity === null || entity === undefined) {
      return html``;
    }

    let value = this.getEntityState(entity);
    let icon = this.renderIcon(entity);
    let useUnit = this.getEntityAttribute(entity, 'unit_of_measurement');
    if (round) {
      value = Math.round(value);
    }
    return html`
      <div
        class="collapsible-item"
        @click="${() => this.handleMore(entity)}"
        ?more-info="true"
      >
        <div class="tooltip">
          <ha-icon icon="${icon}"></ha-icon>
          <br />${value} ${useUnit}
          <span class="tooltiptext">${tooltip}</span>
        </div>
      </div>
    `;
  }

  renderCollapsibleServiceItems(
    entity,
    service,
    text,
    icon,
    tooltip,
    isRequest = true,
    options = {}
  ) {
    let useIcon = icon;
    if (icon === null || icon === undefined) {
      useIcon = this.renderIcon(entity);
    }

    return html`
      <div
        class="collapsible-item"
        @click="${() => this.callService(service, isRequest, options)}"
      >
        <div class="tooltip">
          <ha-icon icon="${useIcon}"></ha-icon>
          <br />${text}
          <span class="tooltiptext">${tooltip}</span>
        </div>
      </div>
    `;
  }

  renderCollapsibleDropDownItems(
    entity,
    service,
    text,
    icon,
    tooltip,
    isRequest = true
  ) {
    if (entity === null || entity === undefined) {
      return html``;
    }

    const sources = cconst.CURRENTLIMITS;
    let value = this.getEntityState(entity);
    let selected = sources.indexOf(value);
    let useUnit = this.getEntityAttribute(entity, 'unit_of_measurement');
    let useIcon = icon === undefined ? this.renderIcon(entity) : icon;

    return html`
      <paper-menu-button
        slot="dropdown-trigger"
        .noAnimations=${true}
        @click="${(e) => e.stopPropagation()}"
      >
        <paper-button slot="dropdown-trigger">
          <div class="tooltip">
            <ha-icon icon="${useIcon}"></ha-icon>
            <br />${value}${useUnit}
            <span class="tooltiptext">${tooltip}</span>
          </div>
        </paper-button>
        <paper-listbox
          slot="dropdown-content"
          selected=${selected}
          @click="${(e) => this.setServiceData(service, isRequest, e)}"
        >
          ${sources.map(
            (item) => html`<paper-item value=${item}>${item}</paper-item>`
          )}
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  renderInfoItemsLeft() {
    const { isOnline } = this.getEntities();
    return html` ${this.renderInfoItem(isOnline, localize('common.online'))} `;
  }

  renderInfoItemsRight() {
    const { totalPower, voltage } = this.getEntities();
    return html`
      ${this.renderInfoItem(voltage, localize('common.voltage'), true)}
      ${this.renderInfoItem(totalPower, localize('common.power'))}
    `;
  }

  renderInfoItemsCompact() {
    const { totalPower, voltage } = this.getEntities();
    return html`
      ${this.renderInfoItem(voltage, localize('common.voltage'), true)}
      ${this.renderInfoItem(totalPower, localize('common.power'), true)}
    `;
  }

  renderInfoItem(entity, tooltip, round = false) {
    if (entity === null || entity === undefined) {
      return html``;
    }
    let value = this.getEntityState(entity);
    let useUnit = this.getEntityAttribute(entity, 'unit_of_measurement');
    let icon = this.renderIcon(entity);
    if (round) {
      value = Math.round(value);
    }
    return html`
      <div
        class="infoitems-item"
        @click="${() => this.handleMore(entity)}"
        ?more-info="true"
      >
        <div class="tooltip">
          <ha-icon icon="${icon}"></ha-icon>
          ${value} ${useUnit}
          <span class="tooltiptext">${tooltip}</span>
        </div>
      </div>
    `;
  }

  renderIcon(entity) {
    let entity_id = entity.entity_id;
    let icon =
      this.getEntityAttribute(entity_id, 'icon') !== undefined
      ? this.getEntityAttribute(entity_id, 'icon')
      : cconst.ICONS[this.getEntityBase(entity_id)] || 'mdi:cancel';
    //TODO: Find a way to get device class icons (which are not in attributes)
    let domainIcon =
      this.getEntityAttribute(entity_id, 'device_class') == !null
        ? domainIcon(
            this.getEntityAttribute(entity_id, 'device_class'),
            this.getEntityState(entity)
          )
        : false;
    return domainIcon || icon;
  }

  renderToolbar(state) {
    /* SHOW TOOLBAR */
    if (!this.showToolbar) {
      return html``;
    }

    /* CUSTOM BUTTONS FROM CONFIG */
    const { actions = [] } = this.config;
    const customButtons = actions.map(
      ({ name, service, icon, service_data }) => {
        return this.renderToolbarButton(service, icon, name, service_data);
      }
    );

    let stateButtons = html``;

    /* STATE BUTTONS */
    switch (state) {
      case cconst.EASEE_CHARGERSTATUS.STANDBY_1: {
        stateButtons = html``;
        break;
      }
      case cconst.EASEE_CHARGERSTATUS.PAUSED_2: {
        stateButtons = html`
          ${this.renderToolbarButton('stop', 'hass:stop', 'common.stop')}
          ${this.renderToolbarButton(
            'resume',
            'hass:play-pause',
            'common.continue'
          )}
          ${this.renderToolbarButton(
            'override_schedule',
            'hass:motion-play',
            'common.override'
          )}
        `;
        break;
      }
      case cconst.EASEE_CHARGERSTATUS.CHARGING_3: {
        stateButtons = html`
          ${this.renderToolbarButton('pause', 'hass:pause', 'common.pause')}
          ${this.renderToolbarButton('stop', 'hass:stop', 'common.stop')}
        `;
        break;
      }
      case cconst.EASEE_CHARGERSTATUS.READY_4: {
        stateButtons = html`
          ${this.renderToolbarButton('stop', 'hass:stop', 'common.stop')}
          ${this.renderToolbarButton(
            'override_schedule',
            'hass:motion-play',
            'common.override'
          )}
        `;
        break;
      }
      case cconst.EASEE_CHARGERSTATUS.ERROR_5: {
        stateButtons = html`
          ${this.renderToolbarButton('reboot', 'hass:restart', 'common.reboot')}
        `;
        break;
      }
      case cconst.EASEE_CHARGERSTATUS.CONNECTED_6: {
        stateButtons = html`
          ${this.renderToolbarButton('stop', 'hass:stop', 'common.stop')}
          ${this.renderToolbarButton(
            'override_schedule',
            'hass:motion-play',
            'common.override'
          )}
        `;
        break;
      }
    }

    return html`
      <div class="toolbar">
        ${stateButtons}
        <div class="fill-gap"></div>
        ${customButtons}
      </div>
    `;
  }

  renderToolbarButton(
    service,
    icon,
    text,
    service_data = {},
    isRequest = true
  ) {
    let useText = '';
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
    const { state } = this.entity;
    return html`
      <ha-card>
        <div class="preview-compact">
          ${this.renderImage(state)}

          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>

          <div class="infoitems">${this.renderInfoItemsCompact()}</div>

          ${this.renderStats(state)}
        </div>

        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  renderFull() {
    const { state } = this.entity;

    return html`
      <ha-card>
        <div class="preview">
          <div class="header">
            <div class="infoitems-left">${this.renderInfoItemsLeft()}</div>

            <div class="infoitems">${this.renderInfoItemsRight()}</div>
          </div>

          ${this.renderImage(state)}

          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>

          ${this.renderCollapsibleConfig()} ${this.renderCollapsibleInfo()}
          ${this.renderCollapsibleLimits()} ${this.renderStats(state)}
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
