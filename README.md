# Metalint

[![NPM][img-npm]][link-npm]
[![Dependencies][img-dependencies]][link-dependencies]
[![Code Climate][img-codeclimate]][link-codeclimate]
[![License][img-license]][link-license]

> *Un linter pour les gouverner tous.*

[Site Internet](//regseb.github.io/metalint/)

## Description

**Metalint** est pour outil pour vérifier (avec des analyseurs syntaxique) tous
les fichiers d'un projet.

## Installation

Vous pouvez installer Metalint en utilisant
[npm](//www.npmjs.com/package/metalint "Node Packaged Modules") :

```shell
sudo npm install -g metalint
```

## Configuration

Tous les fichiers de configuration sont à regrouper dans un répertoire qui doit
être placé à la racine du projet et avoir pour nom : `.metalint`. Ce dossier
doit contenir un fichier `metalint.json`.

## Usage

```shell
metalint
```

## Intégration dans package.json

Il est possible d'intégrer Metalint dans les scripts d'un projet npm, en
ajoutant la commande dans la propriété `"scripts"` du fichier package.json :

```JSON
{
    "...": "...",
    "scripts": {
        "lint": "metalint"
    }
    "...": "..."
}
```

Vous pourrez lancer Metalint avec la commande suivante :

```shell
npm run lint
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
