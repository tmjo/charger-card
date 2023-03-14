// import { css } from 'lit-element';   //https://lit.dev/docs/releases/upgrade/#update-packages-and-import-paths
import { css } from 'lit';

export default css`
  :host {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  ha-card {
    flex-direction: column;
    flex: 1;
    position: relative;
    padding: 0px;
    // border-radius: 4px;
    // overflow: hidden;    // Removed to show tooltips outside of card

    // border-color: coral;
    // border-style: solid;
  }

  .preview {
    background: var(
      --custom-card-background-color
    ); //var(--custom-primary-color);
    cursor: pointer;
    // overflow: hidden;  // Removed to show tooltips outside of card
    position: relative;
    height: auto;
    /* height: 100%; */

    // border-color: yellow;
    // border-style: solid;
  }

  .preview-compact {
    background: var(
      --custom-card-background-color
    ); //var(--custom-primary-color);
    cursor: pointer;
    // overflow: hidden;  // Removed to show tooltips outside of card
    position: relative;
    height: 220px;
    // // border-color: yellow;
    // // border-style: solid;
  }

  .preview.not-available {
    filter: grayscale(1);
  }

  .image{
    display: block;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* border-color: yellow;
    border-style: dashed; */
  }

  .charger {
    // display: block;
    max-width: 90%;
    max-height: 200px;
    image-rendering: crisp-edges;
    margin: 30px auto 20px auto;
    /* border-color: red;
    border-style: dashed; */
  }

  .charger-compact {
    display: block;
    // max-width: 50%;
    // width: 130px;
    max-width: 400px;
    max-height: 130px;
    image-rendering: crisp-edges;
    margin: 20px auto 10px 20px;
    position: absolute;
    // left: -150px;
    // top: -20px;
    left: 10px;
    top: 0px;
    /* border-color: red;
    border-style: dashed; */
  }

  .charger.led {
    /* visibility: visible; */
    display: block;
    width: 2px;
    position: relative;
    top: -200px;

    // display: block;
    // position: relative;
    // top: -175px;
    // position: absolute;
    // // top: 95px;
    // // left: 245px;
    // width: 2px;

    // // border-color: red;
    // // border-style: dashed;

  }

  /* .charger.led-hidden {
    visibility: hidden;
    display: block;
    width: 2px;
    position: relative;
    //top: -175px; 
    top: -200px;

  } */


  .charger.led-compact {
    // position: relative;
    position: absolute;
    top: 20px;
    // position: absolute;
    // top: 95px;
    // left: -170px;
    left: 77px;
    top: 22px;
    width: 1.4px;
    // // border-color: red;
    // // border-style: dashed;
  }

  .charger.charging,
  .charger.on {
    animation: cleaning 5s linear infinite;
  }

  .charger.returning {
    animation: returning 2s linear infinite;
  }

  .charger.paused {
    opacity: 100%;
  }

  .charger.standby {
    opacity: 50%;
  }

  .fill-gap {
    flex-grow: 1;
  }

  .header {
    height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: var(--custom-text-color);

    // border-color: green;
    // border-style: dashed;
  }

  .infoitems {
    // display: flex;
    height: 200px;
    text-align: right;
    // font-weight: bold;
    // transform: translate(-10px, 50%);
    color: var(--custom-text-color);
    top: 30px;
    right: 10px;
    position: absolute;

    // border-color: darkblue;
    // border-style: dashed;
  }

  .infoitems-left {
    // display: flex;
    height: 200px;
    text-align: right;
    // font-weight: bold;
    // transform: translate(10px, 50%);
    color: var(--custom-text-color);
    top: 30px;
    left: 10px;
    position: absolute;

    // border-color: darkgreen;
    // border-style: dashed;
  }

  .infoitems-item-info_right {
    display: flex;
    // spacing: 0px 0 40
    // text-align: right;
    justify-content: right;
    padding: 5px;
    font-weight: bold;
    color: var(--custom-text-color);

    border: 1px;
    // border-style: dotted;
  }

  .infoitems-item-info_left {
    display: flex;
    // spacing: 0px 0 40
    // text-align: right;
    justify-content: left;
    padding: 5px;
    font-weight: bold;
    color: var(--custom-text-color);

    border: 1px;
    // border-style: dotted;
  }

  .metadata {
    display: block;
    position: absolute;
    justify-content: centre;
    top:0;
    width: 100%;
    /* border-color: pink;
    border-style: dashed; */
  }

  .status {
    display: block;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    top: 275px;
    /* border-color: pink;
    border-style: dashed; */
  }

  .status-compact {
    display: block;
    color: var(--custom-text-color);
    position: relative;
    left: 160px;
    top: 30px;
    /* border-color: pink;
    border-style: dashed; */
  }

  .status-text {
    color: var(--custom-text-color);
    white-space: nowrap;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    //margin-left: calc(20px + 9px); /* size + margin of spinner */
    text-transform: uppercase;
    font-size: 22px;
  }
  .status-text-compact {
    color: var(--custom-text-color);
    white-space: nowrap;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    // margin-left: calc(20px + 9px); /* size + margin of spinner */
    text-transform: uppercase;
    font-size: 16px;
  }

  .status-detail-text {
    color: var(--custom-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-transform: uppercase;
    font-size: 9px;
  }

  .status-detail-text-compact {
    // margin-left: calc(20px + 9px); /* size + margin of spinner */
    color: var(--custom-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-transform: uppercase;
    font-size: 9px;
  }

  .status ha-circular-progress {
    --mdc-theme-primary: var(
      --custom-card-background-color
    ); /* hack to override the color */
    min-width: 24px;
    width: 24px;
    height: 24px;
    margin-left: 9px;
  }

  .charger-name {
    text-align: center;
    color: var(--custom-text-color);
    font-size: 16px;
    position: relative;
    top: 270px;
    /* border-color: grey;
    border-style: dashed; */
  }

  .charger-name-compact {
    color: var(--custom-text-color);
    font-size: 16px;
    position: relative;
    left: 160px;
    top: 25px;
    /* border-color: grey;
    border-style: dashed; */
  }

  .not-available {
    text-align: center;
    color: var(--custom-text-color);
    font-size: 16px;
  }

  .stats {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);
    width: 100%;

    // position: relative;
    // top: 100px;
    // top: 450px;
    // top: 450px;

    z-index: 1;
    // border-color: black;
    // border-style: dashed;
  }

  .stats-compact {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);
    position: relative;
    top: 160px;
    /* width: 100%;
    position: absolute;
    left: 0px;
    top: 160px; */

    // // border-color: black;
    // // border-style: dashed;
  }

  .stats-block {
    margin: 10px 0px;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    flex-grow: 1;
    // border-color: black;
    // border-style: dashed;
  }

  .stats-block:last-child {
    border: 0px;
  }

  .stats-value {
    font-size: 20px;
    font-weight: bold;
  }

  ha-icon {
    // color: #fff;
    color: var(--custom-icon-color);
  }

  .toolbar {
    // background: var(--lovelace-background, var(--primary-background-color));
    min-height: 30px;
    display: flex;
    margin: 0 20px 0 20px;
    flex-direction: row;
    justify-content: space-evenly;

    // // border-color: black;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button {
    color: var(--custom-primary-color);
    flex-direction: column;
    width: 44px;
    height: 44px;
    --mdc-icon-button-size: 44px;
    margin: 5px 0;

    // // border-color: red;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button:first-child {
    margin-left: 5px;
  }

  .toolbar ha-icon-button:last-child {
    margin-right: 5px;
  }

  .toolbar mmp-icon-button {
    color: var(--custom-primary-color);
    flex-direction: column;
    margin-right: 10px;
    padding: 10px;
    cursor: pointer;

    // // border-color: blue;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button:active,
  .toolbar mmp-icon-button:active {
    opacity: 0.4;
    background: rgba(0, 0, 0, 0.1);
  }

  .toolbar mmp-icon-button {
    color: var(--custom-primary-color);
    flex-direction: row;
  }

  .toolbar ha-icon {
    color: var(--custom-primary-color);
    padding-right: 15px;
  }

  /* Tooltip container */

  .tooltip {
    position: relative;
    display: inline-block;
    // border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
  }

  /* Tooltip text */
  .tooltip .tooltiptext-right {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    top: 110%;
    right: -60px;
    z-index: 1;
    margin-left: -80px;
  }


  /* Tooltip text */
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    top: 110%;
    left: 20px;
    z-index: 1;
    margin-left: -80px;
  }

  .tooltip .tooltiptext::after, .tooltip-right .tooltiptext-right::after, .tooltip .tooltiptext-right::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    // border-style: solid;
    // border-color: transparent transparent black transparent;
  }


  .tooltip-right .tooltiptext-right {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    z-index: 1;
    margin-left: -80px;
    top: 5px;
    right: 105%;
  }


  .tooltip:hover .tooltiptext, .tooltip-right:hover .tooltiptext-right, .tooltip:hover .tooltiptext-right {
    visibility: visible;
  }








  /* CSS COLLAPSIBLE */

  input[type='checkbox'] {
    display: none;
  }

  /* The button itself to open collapsible content */
  .lbl-toggle {
    display: block;
    padding: 5px;
    color: var(--custom-text-color);
    background: transparent;
    position: absolute;
    right: 0px;
    width: 30px;
    height: 30px;
    z-index: 1;
    /* border-style: solid
    border-color: red; */
  }

  .lbl-toggle-cfg {
    top: 310px;
    /* border-style: dotted
    border-color: green; */
  }

  .lbl-toggle-info {
    top: 280px;
    /* border-style: dotted;
    border-color: darkblue; */
  }

  .lbl-toggle-lim {
    top: 250px;
    /* border-style: dotted;
    border-color: yellow; */
  }  

  .collapsible-content, .collapsible-content-cfg, .collapsible-content-info, .collapsible-content-lim{
    max-height: 0px;
    overflow: hidden;
    /* border-style: dotted;
    border-color: red; */

  }

/* Content area for collapsible content (within full area) */    
  .collapsible-content .content-inner, .collapsible-content-cfg .content-inner-cfg, .collapsible-content-info .content-inner-info, .collapsible-content-lim .content-inner-lim {
    color: var(--custom-text-color);
    background: transparent;
    text-align: center;
    max-height: 200px;
    height: 70px;
    clear: both;
    display: table;
    margin-left: auto;
    margin-right: auto;
    z-index: 999;
    /* border-style: dashed;
    border-color: white; */
  }

  /* Full area for collapsible content */    
  .toggle:checked + .lbl-toggle + .collapsible-content, .toggle-cfg:checked + .lbl-toggle-cfg + .collapsible-content-cfg, .toggle-info:checked + .lbl-toggle-info + .collapsible-content-info, .toggle-lim:checked + .lbl-toggle-lim + .collapsible-content-lim {
    max-height: 200px;
    position: relative;
    top: 0px;
    margin: auto;
    text-align: center;
    vertical-align: middle;
    background: transparent;
    display: block;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);
    overflow: visible;  /* Important to let dropwdown overflow the box */
    /* border-style: solid;
    border-color: red; */
  }

  .collapsible-item {
    display: inline;
    text-align: center;
    align-items: center;
    padding: 5px;
    justify-content: center;
    vertical-align: middle;
  }

  mwc-list {
    display: flex:
    flex-grow: 1;
    flex-wrap: wrap;
    width: auto;
    min-width: 50px;
    padding: 0px;
    border: 1px dotted var(--custom-text-color);
    background: var(--custom-card-background-color);
    //color: var(--custom-text-color);
    overflow-y: auto; /* vertical scrollbar */
    overflow-x: hidden; /* horizontal scrollbar */
  }

  mwc-list-item {
    margin: 0px 0px 0px 5px;
    padding: 0px 0px 0px 5px;
    // min-height: 75px;
    height: auto;
    width: auto;
    color: var(--custom-text-color);
    cursor: pointer;
    background: var(--custom-card-background-color);
    /* background: transparent; */
    font-size: 14px;
    display: block;
    border-bottom: 1px dotted var(--custom-text-color);
  }

  mwc-list-item:hover {
    font-size: 18px;
    font-weight: bold;
  }

`;
