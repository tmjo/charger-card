# Contributing

If you plan to contribute back to this repo, please fork & open a PR.

## How to add translation

Only native speaker should translate to a specific language.

1. Copy `src/translations/en.json` file and name it with appropriate language code.
2. Import your translation in `src/localize.js` file.
3. Mention your translation in `README.md` file.
4. Test it!
5. Open a PR (only language file and readme are allowed).
6. Find someone to check and approve your PR.

## How to add pre-defined `brand`

1. Copy `const_template.js` file and name it with const underscore brand (for instance `const_easee.js`).
2. Add import of your file in the top of `const.js` and add info about your new template brand in the `const CARDCONFIGTYPES` variable inside `const.js`. Se comments in file for further instructions.
3. Modify your new `const_template.js` file to fit your brand. See comments in template file for further instructions.
      - `#ENTITYPREFIX#`: The way it is made to work is that when user specifies the `entity` main sensor, the code will assume alle other sensors contain a part of the name and use to replace you template value with correct entity ids for all other sensors. Use the `#ENTITYPREFIX#` for this value that will be replaced. For instance the main entity is _sensor.CHARGERNAME_status_ given by user, it will assume that a switch in the template will become _switch.CHARGERNAME_smart_charging_ when you define it as _switch.#ENTITYPREFIX#_smart_charging_ in your template.
      - `#SERVICEID#`: A replacement used in the service call, typically for a chargerid or something that must be part of the data when calling service of a specific charger. A part of the `const CARDCONFIGTYPES` variable inside `const.js` defines if this is a state, attribute or an entity id for your template.
      - `#SERVICEVAL#`: A replacement used in the service call, typically for the value from a dropdown or similar. Use this in the template where for instance a current limit is supposed to be sent to a charger.
      - More tags may be added, see comments in template file for further instructions.
4. Mention your brand template in `README.md` file.
5. Test it (preferably have someone else with the same brand test it for you too!)
6. Ask for help in Github issues if you need help with some specifics.
7. Open a PR (only `const.js`, your new `const_template.js` and `README.md` are allowed). Other suggestions or bugfixes should be given in separate PRs.
8. Find someone to check and approve your PR.


## How to run locally

1. Clone this repo to wherever you want:
   ```sh
   git clone https://github.com/tmjo/charger-card.git
   ```
2. Go into the repo folder:
   ```sh
   cd charger-card
   ```
3. Install dependencies (Node.js and npm are required):
   ```sh
   npm install
   ```
4. Run development server. It's going to watch source files, recompile on changes and server compiled file on local server.
   ```sh
   npm start
   ```
5. Add `http://localhost:5000/charger-card.js` to your Lovelace resources.

Now you can make changes to files in `src` folder. Development server will automatically rebuild on changes. Lovelace will load resource from development server. Refresh the browser to see changes. Make sure cache is cleared or disabled (minimum Ctrl+F5 for hard refresh in Chrome).
