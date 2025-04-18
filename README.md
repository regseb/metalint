# Metalint

<!-- Utiliser du HTML (avec l'attribut "align" obsolète) pour faire flotter
     l'image à droite. -->
<!-- markdownlint-disable-next-line no-inline-html-->
<img src="asset/logo.svg" align="right" alt="">

[![npm][img-npm]][link-npm] [![build][img-build]][link-build]
[![coverage][img-coverage]][link-coverage] [![semver][img-semver]][link-semver]

> _One linter to rule them all._

**Metalint** is a tool for analyzing all the files in your project. Analysis is
delegated to linters (static source code analysis tools):

<!-- markdownlint-disable no-inline-html -->
<table>
  <tr>
    <th>Language / Technology</th>
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
      <a title="ajv" href="https://www.npmjs.com/package/ajv">Ajv</a>,
      <a title="@mapbox/jsonlint-lines-primitives"
         href="https://www.npmjs.com/package/@mapbox/jsonlint-lines-primitives">@mapbox/JSON
        Lint lines-primitives</a>,
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
      <a title="depcheck"
         href="https://www.npmjs.com/package/depcheck">Depcheck</a>,
      <a title="npm-check-updates"
         href="https://www.npmjs.com/package/npm-check-updates"
         >npm-check-updates</a>,
      <a title="npm-package-json-lint"
         href="https://www.npmjs.com/package/npm-package-json-lint"
         >npm-package-json-lint</a>,
      <a title="publint"
         href="https://www.npmjs.com/package/publint">publint</a>,
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
    <td>SVG</td>
    <td>
      <a title="prettier"
         href="https://www.npmjs.com/package/prettier">Prettier</a>,
      <a title="svglint"
         href="https://www.npmjs.com/package/svglint">SVGLint</a>
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
  <tr>
    <td></td>
    <td>
      <a title="secretlint"
         href="https://www.npmjs.com/package/secretlint">Secretlint</a>
    </td>
  </tr>
</table>
<!-- markdownlint-enable no-inline-html -->

## Install

You can install Metalint using [npm][link-npm]:

```shell
npm install --save-dev metalint
```

## Configuration

All configuration files are grouped together in the `.metalint/` directory,
which should be placed at the root of the project. The `metalint.config.js` file
exports a JSON object indicating the linters to be used for each file. The other
files contain the specific options for the linters.

## Example

In this example of configuration files, Metalint analyzes JavaScript
(non-minified), HTML and CSS files; with ESLint, HTMLHint and Stylelint linters
respectively.

```javascript
// .metalint/metalint.config.js
export default {
  patterns: ["**", "!/.git/**", "!/node_modules/**"],
  checkers: [
    {
      patterns: ["*.js", "!*.min.js"],
      linters: "eslint",
    },
    {
      patterns: "*.html",
      linters: "htmlhint",
    },
    {
      patterns: "*.css",
      linters: "stylelint",
    },
  ],
};
```

```javascript
// .metalint/eslint.config.js
export default {
  rules: {
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
};
```

```javascript
// .metalint/htmlhint.config.js
export default {
  "attr-value-not-empty": false,
};
```

```javascript
// .metalint/stylelint.config.js
export default {
  rules: {
    "color-no-invalid-hex": true,
  },
};
```

If you want to see real configurations, you've got the
[Metalint configuration](https://github.com/regseb/metalint/tree/HEAD/.metalint)
itself; or the
[Cast Kodi configuration](https://github.com/regseb/castkodi/tree/HEAD/.metalint)
(a browser WebExtension developed in JavaScript, HTML, CSS).

## Integration

### npm

After installing Metalint and the linters in your npm project, you can add the
following script to your `package.json`:

```json
{
  "scripts": {
    "lint": "metalint",
    "lint:fix": "metalint --fix"
  }
}
```

Metalint can now be used with the following commands: `npm run lint` and
`npm run lint:fix`.

### GitHub Actions

To launch Metalint in your GitHub Actions, you can use the `github` formatter to
report problems in pull requests.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Lint files
        run: npm run lint -- --formatter github
```

[img-npm]:
  https://img.shields.io/npm/dm/metalint?label=npm&logo=npm&logoColor=whitesmoke
[img-build]:
  https://img.shields.io/github/actions/workflow/status/regseb/metalint/ci.yml?branch=main&logo=github&logoColor=whitesmoke
[img-coverage]:
  https://img.shields.io/endpoint?label=coverage&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fregseb%2Fmetalint%2Fmain
[img-semver]:
  https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&logoColor=whitesmoke
[link-npm]: https://www.npmjs.com/package/metalint
[link-build]:
  https://github.com/regseb/metalint/actions/workflows/ci.yml?query=branch%3Amain
[link-coverage]:
  https://dashboard.stryker-mutator.io/reports/github.com/regseb/metalint/main
[link-semver]: https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"
