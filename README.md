# Metalint

<!-- Utiliser du HTML pour faire flotter l'image à droite. -->
<!-- markdownlint-disable-next-line no-inline-html-->
<img src="asset/logo.svg" align="right" alt="">

[![npm][img-npm]][link-npm]
[![build][img-build]][link-build]
[![coverage][img-coverage]][link-coverage]
[![semver][img-semver]][link-semver]

> _Un linter pour les gouverner tous._

## Description

**Metalint** est un outil pour analyser tous les fichiers de votre projet.
L'analyse est déléguée à des linters (outils d'analyse statique de code
source) :

<!-- markdownlint-disable no-inline-html -->
<table>
  <tr>
    <th>Langage / Technologie</th>
    <th>Linters</th>
  </tr>
  <tr>
    <td>CoffeeScript</td>
    <td>
      <a title="@coffeelint/cli"
         href="https://www.npmjs.com/package/@coffeelint/cli">CoffeeLint</a>
    </td>
  </tr>
  <tr>
    <td>CSS</td>
    <td>
      <a title="csslint"
         href="https://www.npmjs.com/package/csslint">CSSLint</a>,
      <a title="doiuse" href="https://www.npmjs.com/package/doiuse">DoIUse</a>,
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>,
      <a title="purgecss"
         href="https://www.npmjs.com/package/purgecss">PurgeCSS</a>,
      <a title="stylelint"
         href="https://www.npmjs.com/package/stylelint">Stylelint</a>
   </td>
  </tr>
  <tr>
    <td>HTML</td>
    <td>
      <a title="htmlhint"
         href="https://www.npmjs.com/package/htmlhint">HTMLHint</a>,
      <a title="htmllint"
         href="https://www.npmjs.com/package/htmllint">htmllint</a>,
      <a title="markuplint"
         href="https://www.npmjs.com/package/markuplint">markuplint</a>,
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>
    </td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td>
      <a title="eslint" href="https://www.npmjs.com/package/eslint">ESLint</a>,
      <a title="jshint" href="https://www.npmjs.com/package/jshint">JSHint</a>,
      <a title="standard"
         href="https://www.npmjs.com/package/standard">JavaScript Standard
        Style</a>,
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>
    </td>
  </tr>
  <tr>
    <td>JSON</td>
    <td>
      <a title="@prantlf/jsonlint"
         href="https://www.npmjs.com/package/@prantlf/jsonlint">@prantlf/JSON
        Lint</a>,
      <a title="jsonlint-mod"
         href="https://www.npmjs.com/package/jsonlint-mod">JSON Lint (mod)</a>,
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>
    </td>
  </tr>
  <tr>
    <td>Less</td>
    <td>
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>,
      <a title="stylelint"
         href="https://www.npmjs.com/package/stylelint">Stylelint</a>
    </td>
  </tr>
  <tr>
    <td>Markdown</td>
    <td>
      <a title="markdownlint"
         href="https://www.npmjs.com/package/markdownlint">MarkdownLint</a>
    </td>
  </tr>
  <tr>
    <td>package.json</td>
    <td>
      <!-- markdownlint-disable no-bare-urls -->
      <!-- https://github.com/DavidAnson/markdownlint/issues/961 -->
      <a title="npm-check-updates"
         href="https://www.npmjs.com/package/npm-check-updates"
         >npm-check-updates</a>,
      <!-- markdownlint-enable no-bare-urls -->
      <!-- markdownlint-disable no-bare-urls -->
      <!-- https://github.com/DavidAnson/markdownlint/issues/961 -->
      <a title="npm-package-json-lint"
         href="https://www.npmjs.com/package/npm-package-json-lint"
         >npm-package-json-lint</a>,
      <!-- markdownlint-enable no-bare-urls -->
      <a title="sort-package-json"
         href="https://www.npmjs.com/package/sort-package-json">Sort
        Package.json</a>
    </td>
  </tr>
  <tr>
    <td>SCSS</td>
    <td>
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>,
      <a title="stylelint"
         href="https://www.npmjs.com/package/stylelint">Stylelint</a>
  </td>
  </tr>
  <tr>
    <td>SugarSS</td>
    <td>
      <a title="stylelint"
         href="https://www.npmjs.com/package/stylelint">Stylelint</a>
    </td>
  </tr>
  <tr>
    <td>WebExtension</td>
    <td>
      <a title="addons-linter"
         href="https://www.npmjs.com/package/addons-linter">Add-ons Linter</a>
    </td>
  </tr>
  <tr>
    <td>YAML</td>
    <td>
      <a title="yaml-lint"
         href="https://www.npmjs.com/package/yaml-lint">YAML Lint</a>,
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>
    </td>
  </tr>
</table>
<!-- markdownlint-enable no-inline-html -->

## Installation

Vous pouvez installer Metalint en utilisant [npm][link-npm] :

```Shell
npm install --save-dev --save-exact metalint
```

## Configuration

Tous les fichiers de configuration sont à regrouper dans le répertoire
`.metalint/` qui doit être placé à la racine du projet. Le fichier
`metalint.config.js` export un objet JSON indiquant les linters à utiliser pour
chaque fichier. Les autres fichiers contiennent les options spécifiques pour les
linters.

## Exemple

Dans cet exemple des fichiers de configuration, Metalint analyse les fichiers
JavaScript (non-minifiés), HTML et CSS ; avec respectivement les linters ESLint,
HTMLHint et Stylelint.

```JavaScript
// .metalint/metalint.config.js
export default {
    patterns: ["**", "!/.git/**", "!/node_modules/**"],
    checkers: [
        {
            patterns: ["*.js", "!*.min.js"],
            linters: "eslint",
        }, {
            patterns: "*.html",
            linters: "htmlhint",
        }, {
            patterns: "*.css",
            linters: "stylelint",
        },
    ],
};
```

```JavaScript
// .metalint/eslint.config.js
export default {
    rules: {
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
};
```

```JavaScript
// .metalint/htmlhint.config.js
export default {
    "attr-value-not-empty": false,
};
```

```JavaScript
// .metalint/stylelint.config.js
export default {
    rules: {
        "color-no-invalid-hex": true,
    },
};
```

## Intégration

Après avoir installé Metalint et les linters dans votre projet npm, vous pouvez
ajouter le script suivant dans votre `package.json` :

```JSON
{
    "scripts": {
        "lint": "metalint"
    }
}
```

Metalint est maintenant utilisable avec la commande : `npm run lint`

[img-npm]: https://img.shields.io/npm/dm/metalint?label=npm&logo=npm&logoColor=whitesmoke
[img-build]: https://img.shields.io/github/actions/workflow/status/regseb/metalint/ci.yml?branch=main&logo=github&logoColor=whitesmoke
[img-coverage]: https://img.shields.io/endpoint?label=coverage&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fregseb%2Fmetalint%2Fmain&logo=stryker&logoColor=whitesmoke
[img-semver]: https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&logoColor=whitesmoke
[link-npm]: https://www.npmjs.com/package/metalint
[link-build]: https://github.com/regseb/metalint/actions/workflows/ci.yml?query=branch%3Amain
[link-coverage]: https://dashboard.stryker-mutator.io/reports/github.com/regseb/metalint/main
[link-semver]: https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"
