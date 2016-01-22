# Metalint

[![NPM][img-npm]][link-npm]
[![Dependencies][img-dependencies]][link-dependencies]
[![Code Climate][img-codeclimate]][link-codeclimate]
[![License][img-license]][link-license]

> *Un linter pour les gouverner tous.*

[Site Internet](//regseb.github.io/metalint/)

## Description

**Metalint** est un outil pour vérifier tous les fichiers de votre projet. La
vérification est déléguée à des outils d'analyse statique de code source
(*linters*) selon le type de fichier :

- CSS : [CSSLint](//github.com/CSSLint/csslint) ;
- HTML : [html5-lint](//github.com/mozilla/html5-lint),
  [HTMLHint](//github.com/yaniswang/HTMLHint) et
  [htmllint](//github.com/htmllint/htmllint) ;
- JavaScript : [ESLint](//github.com/eslint/eslint),
  [JSCS](//github.com/jscs-dev/node-jscs) et
  [JSHint](//github.com/jshint/jshint) ;
- JSON : [JSON-Lint](//github.com/codenothing/jsonlint) et
  [JSONLint](//github.com/zaach/jsonlint) ;
- Markdown : [MarkdownLint](//github.com/DavidAnson/markdownlint).

## Installation

Vous pouvez installer Metalint en utilisant
[npm](//www.npmjs.com/package/metalint) :

```shell
npm install -g metalint
```

## Configuration

Tous les fichiers de configuration sont à regrouper dans un répertoire qui doit
être placé à la racine du projet et avoir pour nom : `.metalint/`. Le fichier
`metalint.json` contient un objet JSON indiquant les linters à utiliser pour
chaque fichier. Les autres fichiers contiennent les options pour les linters.

## Exemple

Dans cet exemple du fichier de configuration `metalint.json`, Metalint vérifie
les fichiers HTML, CSS et JavaScript ; avec les linters HTMLHint, JSCS, JSHint
et CSSLint.

```JSON
{
    "patterns": ["**", "!*_modules/**"],
    "checkers": [
        {
            "patterns": "**/*.html",
            "linters": "htmlhlint"
        }, {
            "patterns": ["**/*.js", "!**/*.min.js"],
            "linters": ["jscs", "jshint"]
        }, {
            "patterns": "**/*.css",
            "linters": "csslint"
        }
    ]
}
```

## Usage

```shell
metalint
```

[img-npm]:https://img.shields.io/npm/v/metalint.svg
[img-dependencies]:https://img.shields.io/david/regseb/metalint.svg
[img-codeclimate]:https://img.shields.io/codeclimate/github/regseb/metalint.svg
[img-license]:https://img.shields.io/badge/license-EUPL-blue.svg

[link-npm]://npmjs.com/package/metalint "Node Packaged Modules"
[link-dependencies]://david-dm.org/regseb/metalint
[link-codeclimate]://codeclimate.com/github/regseb/metalint
[link-license]://joinup.ec.europa.eu/software/page/eupl/licence-eupl
               "Licence Publique de l’Union européenne"
