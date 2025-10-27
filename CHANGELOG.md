# Changelog

## [0.21.1](https://github.com/regseb/metalint/compare/v0.21.0...v0.21.1) (2025-10-27)

### Bug Fixes

- Fix publish in npm.
  ([5117a99](https://github.com/regseb/metalint/commit/5117a99d1078f69035698c6685b3cb2aef241c41))

## [0.21.0](https://github.com/regseb/metalint/compare/v0.20.0...v0.21.0) (2025-10-27)

### Features

- Add Biome support.
  ([ed5fa53](https://github.com/regseb/metalint/commit/ed5fa53199b855a592b4f24be5ef59d114e92d33))

### Bug Fixes

- **markuplint:** Support `null` result.
  ([b024ba4](https://github.com/regseb/metalint/commit/b024ba48c39001ffa1930ec9c038986677277ff6))

## [0.20.0](https://github.com/regseb/metalint/compare/v0.19.0...v0.20.0) (2025-04-05)

### Features

- Add SecretLint support.
  ([f135cc5](https://github.com/regseb/metalint/commit/f135cc5e963de70eca36e9f7a8ee98f1593fd0c9))

### Bug Fixes

- **markdownlint:** Fix file with ERROR level.
  ([63a4964](https://github.com/regseb/metalint/commit/63a4964e05a9bf04007411e9e8acb27193c67600))
- **npm-package-json-lint:** Reject invalid file.
  ([dc0ced4](https://github.com/regseb/metalint/commit/dc0ced40319133477e706df78097821a22902b7a))
- **purgecss:** Reject invalid file.
  ([34ffc4c](https://github.com/regseb/metalint/commit/34ffc4cb9aac8f53abcedc0e90b1a63debef45c8))

## [0.19.0](https://github.com/regseb/metalint/compare/v0.18.0...v0.19.0) (2025-01-02)

### Features

- Auto-corriger des problèmes avec Markdownlint.
  ([6d748df](https://github.com/regseb/metalint/commit/6d748dfc8411c5b704b06d2b2ba4e42800bdc01f))

### Bug Fixes

- Enlever le linter obsolète CSSLint.
  ([170072f](https://github.com/regseb/metalint/commit/170072f54d9c4c4e4cad8a2e09d11cb87a54de17))

## [0.18.0](https://github.com/regseb/metalint/compare/v0.17.0...v0.18.0) (2024-10-05)

### Features

- Supporter ESLint v9 et FlatConfig.
  ([3fff1e4](https://github.com/regseb/metalint/commit/3fff1e47a8a6423a56d3fdd8a4c4e73e0c2ac068))
- Supporter SVGLint v3.
  ([e79639d](https://github.com/regseb/metalint/commit/e79639d166e970aafe517d74a4b0b65122c6509a))

## [0.17.0](https://github.com/regseb/metalint/compare/v0.16.0...v0.17.0) (2024-05-12)

### Features

- Gérer le linter JSON Lint lines-primitives.
  ([19308aa](https://github.com/regseb/metalint/commit/19308aad873577d63aaf26d4d2945d070fc0e93e))

### Bug Fixes

- Simplifier la configuration.
  ([1fc976c](https://github.com/regseb/metalint/commit/1fc976c69eb3640b3af1073e307db6cf3574c835))

## [0.16.0](https://github.com/regseb/metalint/compare/v0.15.0...v0.16.0) (2024-04-02)

### Features

- Exporter le type de la configuration.
  ([fe12820](https://github.com/regseb/metalint/commit/fe128206c483e365a426275eef2dfa421c772f7a))

### Bug Fixes

- Gérer des patrons identiques.
  ([1af4024](https://github.com/regseb/metalint/commit/1af402432829fe7ae43731555e71d3333c76d522))

## [0.15.0](https://github.com/regseb/metalint/compare/v0.14.1...v0.15.0) (2024-01-04)

### Features

- Ajouter un wrapper pour Ajv.
  ([44c124b](https://github.com/regseb/metalint/commit/44c124ba6c8ed38285a88b807d0346fe0dde900c))
- Ajouter un wrapper pour Depcheck.
  ([a48ffb9](https://github.com/regseb/metalint/commit/a48ffb94dae3a3c03d88a172b843fe695105d57b))
- Ajouter un wrapper pour publint.
  ([709c8a3](https://github.com/regseb/metalint/commit/709c8a3761cd728e4fd0a7a172df799810fd2b5f))
- Ajouter un wrapper pour SVGLint.
  ([ec38803](https://github.com/regseb/metalint/commit/ec388039229f4727af966ab88e586bacaf9569e9))
- Refactoriser l'API.
  ([5763b04](https://github.com/regseb/metalint/commit/5763b044d70993e31bce9d3dea27f3b6e3d2bb82))

## [0.14.1](https://github.com/regseb/metalint/compare/v0.14.0...v0.14.1) (2023-09-10)

### Bug Fixes

- Actualiser le package-lock.json.
  ([31dca91](https://github.com/regseb/metalint/commit/31dca9178fb1d8a1310cacc656c2b9c5d30eb0ae))

## [0.14.0](https://github.com/regseb/metalint/compare/v0.13.0...v0.14.0) (2023-09-10)

### Features

- Exporter les classes Formatter et Wrapper pour pouvoir les étendre.
  ([6729af7](https://github.com/regseb/metalint/commit/6729af77be438b4cca6fffe8742afce0f4e6f60c))
- Gérer les configurations Flat de ESLint.
  ([4fe54a6](https://github.com/regseb/metalint/commit/4fe54a689f6d93d4242b880f8f441c17693fa5bb))

### Bug Fixes

- Corriger le cache des wrappers et de leurs configurations.
  ([2a51a86](https://github.com/regseb/metalint/commit/2a51a86d1fdd5fad8dbc81c6ad247624eb7b3734))
- Ne plus préremplir la configuration des linters.
  ([24b37ff](https://github.com/regseb/metalint/commit/24b37ff58cc8aac4bafe2c59b4beaa28a74b1832))

## [0.13.0](https://github.com/regseb/metalint/compare/v0.12.0...v0.13.0) (2023-07-22)

### Features

- Ajouter un wrapper pour npm-check-updates.
  ([6d624ea](https://github.com/regseb/metalint/commit/6d624ea195fb57f8af9cb3523df9fc6bb97efddb))
- Ajouter un wrapper pour sort-package-json.
  ([2024b62](https://github.com/regseb/metalint/commit/2024b62917fd3f5451ca6d00948d29c688747db6))

### Bug Fixes

- Corriger les fichiers même avec le niveau OFF.
  ([d9697d2](https://github.com/regseb/metalint/commit/d9697d2f36f99eeeed65da16edc7f2c753fdcf6c))
- Gérer la v3 de Prettier.
  ([5ff075f](https://github.com/regseb/metalint/commit/5ff075fcb57f06bd41145d7bbd656ea19d55d097))
- Gérer la v6 de DoIUse.
  ([7e86dde](https://github.com/regseb/metalint/commit/7e86dded63f8bb82ed912cfda90af87ea4211a80))

## [0.12.0](https://github.com/regseb/metalint/compare/v0.11.1...v0.12.0) (2023-04-30)

### Features

- Ajouter les propriétés "overrides".
  ([61b81d7](https://github.com/regseb/metalint/commit/61b81d7882bb14c920bb4df2da6016a1dafc8332))

## [0.11.1](https://github.com/regseb/metalint/compare/v0.11.0...v0.11.1) (2023-03-04)

### Features

- Ajouter le wrapper pour Prettier.
  ([c4e5075](https://github.com/regseb/metalint/commit/c4e5075813376a28a065e18932e348e7d1d88af1))
- Ajouter une option pour corriger les fichiers.
  ([ef96f0d](https://github.com/regseb/metalint/commit/ef96f0d2e47162b757c9237a175016593daa3f8a))

### Bug Fixes

- "\*" représente seulement les fichiers.
  ([13d76d4](https://github.com/regseb/metalint/commit/13d76d4a5aeca82f8c38c198d7dab6acea1e827c))

## [0.11.0](https://github.com/regseb/metalint/compare/v0.10.0...v0.11.0) (2022-11-15)

### Features

- Ajouter la gestion de LintHTML.
  ([5b3f757](https://github.com/regseb/metalint/commit/5b3f757c05a346f5f5d1985b2c6f160a800ac7c3))
- Ajouter la gestion de markuplint.
  ([3a72a80](https://github.com/regseb/metalint/commit/3a72a80ee1f400a9ff272cb26efb862bca4e1190))
- Ajouter la gestion de npm-package-json-lint.
  ([062edc4](https://github.com/regseb/metalint/commit/062edc43ad8523ccc7eabe68834697dbacb39b7b))
- Ajouter un formateur pour les GitHub Actions.
  ([cb2335c](https://github.com/regseb/metalint/commit/cb2335cf9c8c97ed7ddc14fab14c79f5e144f70a))
- Permettre de passer des options à addons-linter.
  ([a9962ad](https://github.com/regseb/metalint/commit/a9962adc839843c97264c2a9dffb4cdc505f80c7))

### Bug Fixes

- Gérer la dernière version de standard.
  ([3e4ca6a](https://github.com/regseb/metalint/commit/3e4ca6a5d88d805a6523be6db91bdf22a9c483ef))
- Gérer le pattern '/'.
  ([e146951](https://github.com/regseb/metalint/commit/e1469513e745cd47a0f3a58cda007b9e533ecd74))
- Renommer lineEnd en endLine (idem pour columnEnd).
  ([1e88d5f](https://github.com/regseb/metalint/commit/1e88d5ff378f2733588a2bdfbc7b5429aea2c383))

## [0.10.0](https://github.com/regseb/metalint/compare/v0.9.0...v0.10.0) (2022-03-30)

## [0.9.0](https://github.com/regseb/metalint/compare/v0.8.9...v0.9.0) (2020-11-20)

## [0.8.9](https://github.com/regseb/metalint/compare/v0.8.8...v0.8.9) (2020-05-17)

## [0.8.8](https://github.com/regseb/metalint/compare/v0.8.7...v0.8.8) (2020-05-11)

### Features

- Gérer l'option whitelistPatterns de PurgeCSS.
  ([b1bec7f](https://github.com/regseb/metalint/commit/b1bec7fe670aec5ef2b47c2f104e02e0d1fa46ac))

## [0.8.7](https://github.com/regseb/metalint/compare/v0.8.6...v0.8.7) (2020-04-14)

### Bug Fixes

- Corriger la validation du fichier de configuration.
  ([3a88ca4](https://github.com/regseb/metalint/commit/3a88ca430e626800f940aa0db5235a8a43332d00))

## [0.8.6](https://github.com/regseb/metalint/compare/v0.8.5...v0.8.6) (2020-04-12)

### Features

- Ajouter le support de JSON Lint (mod).
  ([201ae31](https://github.com/regseb/metalint/commit/201ae31ab436e8223b964b3017a4c838bfd378e0))

### Bug Fixes

- Autoriser la valeur null pour la configuration de Stylelint.
  ([758d38f](https://github.com/regseb/metalint/commit/758d38fbdcc96386bb4f9bf938d01117931b40e8))

## [0.8.5](https://github.com/regseb/metalint/compare/v0.8.4...v0.8.5) (2020-01-23)

### Bug Fixes

- Gérer la version 2 de PurgeCSS.
  ([b94d1fd](https://github.com/regseb/metalint/commit/b94d1fd094166f57687a3bc430aac6169d765c71))

## 0.8.4 (2019-08-10)

### Bug Fixes

- Retourner le début et la fin des "locations".
  ([4431658](https://github.com/regseb/metalint/commit/4431658))
