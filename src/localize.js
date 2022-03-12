// Borrowed from:
// https://github.com/custom-cards/boilerplate-card/blob/master/src/localize/localize.ts

import * as en from './translations/en.json';
import * as nb from './translations/nb.json';
import * as sv from './translations/sv.json';
import * as de from './translations/de.json';
import * as da from './translations/da.json';
import * as ca from './translations/ca.json';

var languages = {
  en,
  nb,
  sv,
  de,
  da,
  ca
};

export default function localize(string, brand=null, search = '', replace = '', debug=false){
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');
  let translated;
  let brandstr = brand === undefined || brand === null ? string : brand + "." + string;

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
