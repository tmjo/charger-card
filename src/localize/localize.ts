import * as en from './languages/en.json';
import * as en_GB from './languages/en-GB.json';
import * as nb from './languages/nb.json';
import * as sv from './languages/sv.json';
import * as de from './languages/de.json';
import * as da from './languages/da.json';
import * as ca from './languages/ca.json';
import * as fr from './languages/fr.json';
import * as nl from './languages/nl.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  en: en,
  en_GB: en_GB,
  nb: nb,
  sv: sv,
  de: de,
  da: da,
  ca: ca,
  fr: fr,
  nl: nl,
};

export function localize(string, brand=null, search = '', replace = '', debug=false){
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');
  if(debug) console.log("Received language -> " +localStorage.getItem('selectedLanguage') +" --> " +lang);
  let translated;
  let brandstr = brand === undefined || brand === null ? string : brand + "." + string;

  //Do not translate numbers (some states are translated such as on/off etc)
  if(Number(string)){
    return string;
  }

  try {
    // Try to translate, add brand if valid
    translated = brandstr.split('.').reduce((o, i) => o[i], languages[lang]);
    if(debug) console.log("Translating 1 -> " +lang +": " + string + " --> " + brandstr + " --> " + translated);

    if (translated === undefined) {
      translated = brandstr.toLowerCase().split('.').reduce((o, i) => o[i], languages[lang]);
      if(debug) console.log("Translating 2 -> " +lang +" lowercase: " +string +" --> " +brandstr +" --> " +translated);
    }

    if (translated === undefined) {
      translated = brandstr.split('.').reduce((o, i) => o[i], languages['en']);
      if(debug) console.log("Translating 3 -> en  : " +string +" --> " +brandstr +" --> " +translated);
    }

    if (translated === undefined) {
      translated = brandstr.toLowerCase().split('.').reduce((o, i) => o[i], languages['en']);
      if(debug) console.log("Translating 4 -> en lowercase: " +string +" --> " +brandstr +" --> " +translated);
    }
  }catch (e) {
    // Give up, do nothing
  }


  if (translated === undefined) {
    // If translation failed, return last item of array
    var strArray = string.split(".");
    translated = strArray.length > 0 ? strArray[strArray.length-1] : strArray;
    if(debug) console.log("Gave up translating: " +string +" --> " +strArray +" --> " +translated);
  }

  //Search and replace
  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }

  //Return
  return translated || string;
}
