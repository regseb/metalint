# Metalint

[![npm][img-npm]][link-npm]
[![build][img-build]][link-build]
[![coverage][img-coverage]][link-coverage]
[![semver][img-semver]][link-semver]

> _Un linter pour les gouverner tous._

## Description

**Metalint** est un outil pour analyser tous les fichiers de votre projet.
L'analyse est déléguée à des linters (outils d'analyse statique de code source)
ou des utilitaires selon le type de fichier :

- _Générique_ :
  [Prettier](https://regseb.github.io/metalint/user/linters/prettier/) ;
- WebExtension : [Add-ons
  Linter](https://regseb.github.io/metalint/user/linters/addons-linter/) ;
- CoffeeScript :
  [CoffeeLint](https://regseb.github.io/metalint/user/linters/coffeelint/) ;
- CSS (SCSS, Sass, Less) :
  [CSSLint](https://regseb.github.io/metalint/user/linters/csslint/),
  [doiuse](https://regseb.github.io/metalint/user/linters/doiuse/),
  [lesshint](https://regseb.github.io/metalint/user/linters/lesshint/),
  [PurgeCSS](https://regseb.github.io/metalint/user/linters/purgecss/) et
  [stylelint](https://regseb.github.io/metalint/user/linters/stylelint/) ;
- HTML : [HTMLHint](https://regseb.github.io/metalint/user/linters/htmlhint/),
  [htmllint](https://regseb.github.io/metalint/user/linters/htmllint/) et
  [markuplint](https://regseb.github.io/metalint/user/linters/markuplint/) ;
- JavaScript : [ESLint](https://regseb.github.io/metalint/user/linters/eslint/),
  [Flow](https://regseb.github.io/metalint/user/linters/flow-bin/),
  [JSHint](https://regseb.github.io/metalint/user/linters/jshint/) et
  [JavaScript Standard
  Style](https://regseb.github.io/metalint/user/linters/standard/) ;
- JSON : [JSON-Lint](https://regseb.github.io/metalint/user/linters/json-lint/),
  [JSON Lint](https://regseb.github.io/metalint/user/linters/jsonlint/) et
  [JSON Lint
  (mod)](https://regseb.github.io/metalint/user/linters/jsonlint-mod/) ;
  - package.json (npm) :
    [npm-package-json-lint](https://regseb.github.io/metalint/user/linters/npm-package-json-lint/)
    ;
- Markdown :
  [MarkdownLint](https://regseb.github.io/metalint/user/linters/markdownlint/) ;
- YAML : [YAML Lint](https://regseb.github.io/metalint/user/linters/yaml-lint/).

## Installation

Vous pouvez installer Metalint en utilisant [npm][link-npm] :

```Shell
npm install metalint --save-dev
```

## Configuration

Tous les fichiers de configuration sont à regrouper dans le répertoire
`.metalint/` qui doit être placé à la racine du projet. Le fichier
`metalint.config.js` contient un objet JSON indiquant les linters à utiliser
pour chaque fichier. Les autres fichiers contiennent les options spécifiques
pour les linters.

## Exemple

Dans cet exemple du fichier de configuration `metalint.json`, Metalint analyse
les fichiers JavaScript (non-minifiés), HTML et CSS ; avec respectivement les
linters ESLint, HTMLHint et stylelint.

```JavaScript
export default {
    patterns: ["!/.git/", "!/node_modules/", "**"],
    checkers: [
        {
            patterns: ["!*.min.js", "*.js"],
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

## Usage

```Shell
metalint
```

[img-npm]: https://img.shields.io/npm/dm/metalint?label=npm&logo=npm&logoColor=white
[img-build]: https://img.shields.io/github/actions/workflow/status/regseb/metalint/ci.yml?branch=main&logo=github&logoColor=white

<!-- Attendre que le logo de Stryker soit accepté.
     https://github.com/simple-icons/simple-icons/pull/7388 -->

[img-coverage]: https://img.shields.io/endpoint?label=coverage&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fregseb%2Fmetalint%2Fmain
[img-semver]: https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&logoColor=white
[link-npm]: https://www.npmjs.com/package/metalint
[link-build]: https://github.com/regseb/metalint/actions/workflows/ci.yml?query=branch%3Amain
[link-coverage]: https://dashboard.stryker-mutator.io/reports/github.com/regseb/metalint/main
[link-semver]: https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"
