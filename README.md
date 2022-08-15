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
  [linthtml](https://regseb.github.io/metalint/user/linters/linthtml/) ;
- JavaScript : [ESLint](https://regseb.github.io/metalint/user/linters/eslint/),
  [Flow](https://regseb.github.io/metalint/user/linters/flow-bin/),
  [JSHint](https://regseb.github.io/metalint/user/linters/jshint/) et
  [JavaScript Standard
  Style](https://regseb.github.io/metalint/user/linters/standard/) ;
- JSON : [JSON-Lint](https://regseb.github.io/metalint/user/linters/json-lint/),
  [JSON Lint](https://regseb.github.io/metalint/user/linters/jsonlint/) et
  [JSON Lint
  (mod)](https://regseb.github.io/metalint/user/linters/jsonlint-mod/) ;
- Markdown :
  [MarkdownLint](https://regseb.github.io/metalint/user/linters/markdownlint/) ;
- YAML : [YAML Lint](https://regseb.github.io/metalint/user/linters/yaml-lint/).

## Installation

Vous pouvez installer Metalint en utilisant [npm][link-npm] :

```shell
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

```shell
metalint
```

<!-- Ne pas ajouter les logos car la couleur du logo de npm n'est pas
     personnalisable. https://github.com/badges/shields/issues/6208 -->
[img-npm]:https://img.shields.io/npm/dm/metalint?label=npm
[img-build]:https://img.shields.io/github/workflow/status/regseb/metalint/CI
[img-coverage]:https://img.shields.io/coveralls/github/regseb/metalint
[img-semver]:https://img.shields.io/badge/semver-2.0.0-blue

[link-npm]:https://www.npmjs.com/package/metalint
[link-build]:https://github.com/regseb/metalint/actions/workflows/ci.yml?query=branch%3Amain
[link-coverage]:https://coveralls.io/github/regseb/metalint
[link-semver]:https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"
