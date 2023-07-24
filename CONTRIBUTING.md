# Contributing
If you plan to contribute back to this repo, please fork & open a PR.


## How to add a brand
See Wiki on [how to add a brand](https://github.com/tmjo/charger-card/wiki/How-to-add-template-for-new-brand). Follow the instructions and open a PR. If you do not have the knowledge to do all this, please join up with some fellow charger friends that share your needs and do it together.


## How to add translation

Only native speaker should translate to specific language.

1. Copy `src/localize/languages/en.json` file and name it with appropriate language code.
2. Translate only keys in this file, not values.
3. Import your translation in `src/localize/localize.ts` file and add it to _const languages_. Both are at the top of the file, see how others did it.
4. Mention your translation in `README.md` file under translations.
5. Test that everything works fine!
6. Open a PR.

## How to run locally
1. Clone this repo to wherever you want (typically to the config/www folder of HA or your HA dev container)
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

Now you can make changes to files in `src` folder. Development server will automatically rebuild on changes. Lovelace will load resource from development server. Refresh the browser to see changes. Make sure cache is cleared or disabled.

