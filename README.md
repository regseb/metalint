# Metalint

[![NPM][img-npm]][link-npm]
[![Build][img-build]][link-build]
[![Dependencies][img-dependencies]][link-dependencies]
[![Code Climate][img-codeclimate]][link-codeclimate]
[![Coverage][img-coverage]][link-coverage]
[![License][img-license]][link-license]

> *Un linter pour les gouverner tous.*

[Site Internet](//regseb.github.io/metalint/)

## Description

**Metalint** est un outil pour analyser tous les fichiers de votre projet.
L’analyse est déléguée à des linters (outils d’analyse statique de code source)
selon le type de fichier :

- Add-on de Firefox :
  [Add-ons Linter](//regseb.github.io/metalint/user/linters/addons-linter/) ;
- CSS : [CSSLint](//regseb.github.io/metalint/user/linters/csslint/) et
  [stylelint](//regseb.github.io/metalint/user/linters/stylelint/) ;
- HTML : [HTMLHint](//regseb.github.io/metalint/user/linters/htmlhint/) et
  [htmllint](//regseb.github.io/metalint/user/linters/htmllint/) ;
- JavaScript : [ESLint](//regseb.github.io/metalint/user/linters/eslint/),
  [Flow](//regseb.github.io/metalint/user/linters/flow-bin/),
  [JSCS](//regseb.github.io/metalint/user/linters/jscs/),
  [JSHint](//regseb.github.io/metalint/user/linters/jshint/) et
  [JavaScript Standard
   Style](//regseb.github.io/metalint/user/linters/standard) ;
- JSON : [JSON-Lint](//regseb.github.io/metalint/user/linters/json-lint/) et
  [JSONLint](//regseb.github.io/metalint/user/linters/jsonlint/) ;
- Markdown :
  [MarkdownLint](//regseb.github.io/metalint/user/linters/markdownlint/).

## Installation

Vous pouvez installer Metalint en utilisant
[npm](//www.npmjs.com/package/metalint) :

```shell
npm install -g metalint
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
    "patterns": ["!git/**", "!node_modules/**", "**"],
    "checkers": [
        {
            "patterns": ["!**/*.min.js", "**/*.js"],
            "linters": "eslint"
        }, {
            "patterns": "**/*.html",
            "linters": "htmlhint"
        }, {
            "patterns": "**/*.css",
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
[img-codeclimate]:https://img.shields.io/codeclimate/github/regseb/metalint.svg
[img-coverage]:https://img.shields.io/coveralls/regseb/metalint.svg
[img-license]:https://img.shields.io/badge/license-EUPL-blue.svg

[link-npm]://npmjs.com/package/metalint
[link-build]://travis-ci.org/regseb/metalint
[link-dependencies]://david-dm.org/regseb/metalint
[link-codeclimate]://codeclimate.com/github/regseb/metalint
[link-coverage]://coveralls.io/github/regseb/metalint
[link-license]://joinup.ec.europa.eu/software/page/eupl/licence-eupl
               "Licence Publique de l’Union européenne"
