# Metalint

[![NPM][img-npm]][link-npm]
[![Build][img-build]][link-build]
[![Dependencies][img-dependencies]][link-dependencies]
[![Coverage][img-coverage]][link-coverage]
[![License][img-license]][link-license]

> *Un linter pour les gouverner tous.*

[Site Internet](https://regseb.github.io/metalint/)

## Description

**Metalint** est un outil pour analyser tous les fichiers de votre projet.
L’analyse est déléguée à des linters (outils d’analyse statique de code source)
ou des utilitaires selon le type de fichier :

- Add-on de Firefox (WebExtension) :
  [Add-ons
   Linter](https://regseb.github.io/metalint/user/linters/addons-linter/) ;
- CSS (SCSS, Sass, Less) :
  [CSSLint](https://regseb.github.io/metalint/user/linters/csslint/),
  [doiuse](https://regseb.github.io/metalint/user/linters/doiuse/),
  [lesshint](https://regseb.github.io/metalint/user/linters/lesshint/),
  [Purgecss](https://regseb.github.io/metalint/user/linters/purgecss/) et
  [stylelint](https://regseb.github.io/metalint/user/linters/stylelint/) ;
- HTML : [HTMLHint](https://regseb.github.io/metalint/user/linters/htmlhint/) et
  [htmllint](https://regseb.github.io/metalint/user/linters/htmllint/) ;
- JavaScript : [ESLint](https://regseb.github.io/metalint/user/linters/eslint/),
  [Flow](https://regseb.github.io/metalint/user/linters/flow-bin/),
  [JSCS](https://regseb.github.io/metalint/user/linters/jscs/),
  [JSHint](https://regseb.github.io/metalint/user/linters/jshint/) et
  [JavaScript Standard
   Style](https://regseb.github.io/metalint/user/linters/standard) ;
- JSON : [JSON-Lint](https://regseb.github.io/metalint/user/linters/json-lint/)
  et [JSON Lint](https://regseb.github.io/metalint/user/linters/jsonlint/) ;
- Markdown :
  [MarkdownLint](https://regseb.github.io/metalint/user/linters/markdownlint/) ;
- `package.json` (npm) :
  [David DM](https://regseb.github.io/metalint/user/linters/david/) ;
- YAML : [YAML Lint](https://regseb.github.io/metalint/user/linters/yaml-lint).

## Installation

Vous pouvez installer Metalint en utilisant
[npm](https://www.npmjs.com/package/metalint) :

```shell
npm install metalint --save-dev
```

## Configuration

Tous les fichiers de configuration sont à regrouper dans le répertoire
`.metalint/` qui doit être placé à la racine du projet. Le fichier
`metalint.json` contient un objet JSON indiquant les linters à utiliser pour
chaque fichier. Les autres fichiers contiennent les options pour les linters.

## Exemple

Dans cet exemple du fichier de configuration `metalint.json`, Metalint analyse
les fichiers JavaScript (non-minifiés), HTML et CSS ; avec respectivement les
linters ESLint, HTMLHint et stylelint.

```JSON
{
    "patterns": ["!/.git/", "!/node_modules/", "**"],
    "checkers": [
        {
            "patterns": ["!*.min.js", "*.js"],
            "linters": "eslint"
        }, {
            "patterns": "*.html",
            "linters": "htmlhint"
        }, {
            "patterns": "*.css",
            "linters": "stylelint"
        }
    ]
}
```

## Usage

```shell
metalint
```

[img-npm]:https://img.shields.io/npm/v/metalint.svg
[img-build]:https://img.shields.io/travis/regseb/metalint.svg
[img-dependencies]:https://img.shields.io/david/regseb/metalint.svg
[img-coverage]:https://img.shields.io/coveralls/regseb/metalint.svg
[img-license]:https://img.shields.io/badge/license-EUPL-blue.svg

[link-npm]:https://www.npmjs.com/package/metalint
[link-build]:https://travis-ci.org/regseb/metalint
[link-dependencies]:https://david-dm.org/regseb/metalint
[link-coverage]:https://coveralls.io/github/regseb/metalint
[link-license]:https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12
               "Licence publique de l’Union européenne"
