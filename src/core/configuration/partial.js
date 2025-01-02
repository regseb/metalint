/* eslint-disable unicorn/no-empty-file */
/**
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @import { Level } from "../levels.js"
 * @import { TypeofFormatter } from "../formatter/formatter.js"
 * @import { TypeofWrapper } from "../wrapper/wrapper.js"
 */

/**
 * @typedef {Level|"OFF"|"FATAL"|"ERROR"|"WARN"|"INFO"} PartialConfigLevel Le
 *                                                                         type
 *                                                                         d'un
 *                                                                         niveau
 *                                                                         partiel.
 */

/**
 * @typedef {Record<string, unknown>|string} PartialConfigOption Le type des
 *                                                               options
 *                                                               partielles d'un
 *                                                               formateur ou
 *                                                               d'un linter.
 */

/**
 * @typedef {Object} PartialConfigReporter Le type d'une configuration partielle
 *                                         d'un rapporteur.
 * @prop {TypeofFormatter|string}                    formatter La classe du
 *                                                             formateur.
 * @prop {PartialConfigLevel}                        [level]   Le niveau de
 *                                                             sévérité minimum
 *                                                             des notifications
 *                                                             affichées.
 * @prop {PartialConfigOption|PartialConfigOption[]} [options] Les options du
 *                                                             formateur.
 */

/**
 * @typedef {Object} PartialConfigLinterObject Le type d'une configuration
 *                                             partielle détaillée d'un linter.
 * @prop {TypeofWrapper|string}                      wrapper   La classe de
 *                                                             l'enrobage.
 * @prop {boolean}                                   [fix]     La marque
 *                                                             indiquant s'il
 *                                                             faut corriger les
 *                                                             fichiers.
 * @prop {PartialConfigLevel}                        [level]   Le niveau de
 *                                                             sévérité minimum
 *                                                             des notifications
 *                                                             retournées.
 * @prop {PartialConfigOption|PartialConfigOption[]} [options] Les options du
 *                                                             linter.
 */

/**
 * @typedef {string|PartialConfigLinterObject} PartialConfigLinter Le type d'une
 *                                                                 configuration
 *                                                                 partielle
 *                                                                 d'un linter.
 */

/**
 * @typedef {Object} PartialConfigOverride Le type d'une configuration partielle
 *                                         d'une surcharge.
 * @prop {string[]|string}                           patterns Les motifs des
 *                                                            fichiers à
 *                                                            analyser.
 * @prop {boolean}                                   [fix]    La marque
 *                                                            indiquant s'il
 *                                                            faut corriger les
 *                                                            fichiers.
 * @prop {PartialConfigLevel}                        [level]  Le niveau de
 *                                                            sévérité minimum
 *                                                            des notifications
 *                                                            retournées.
 * @prop {PartialConfigLinter|PartialConfigLinter[]} linters  Les configurations
 *                                                            des linters.
 */

/**
 * @typedef {Object} PartialConfigChecker Le type d'une configuration partielle
 *                                        d'un checker.
 * @prop {string[]|string}                               patterns    Les motifs
 *                                                                   des
 *                                                                   fichiers à
 *                                                                   analyser.
 * @prop {boolean}                                       [fix]       La marque
 *                                                                   indiquant
 *                                                                   s'il faut
 *                                                                   corriger
 *                                                                   les
 *                                                                   fichiers.
 * @prop {PartialConfigLevel}                            [level]     Le niveau
 *                                                                   de sévérité
 *                                                                   minimum des
 *                                                                   notifications
 *                                                                   retournées.
 * @prop {PartialConfigLinter|PartialConfigLinter[]}     [linters]   Les
 *                                                                   configurations
 *                                                                   des
 *                                                                   linters.
 * @prop {PartialConfigOverride|PartialConfigOverride[]} [overrides] Les
 *                                                                   configurations
 *                                                                   des
 *                                                                   surcharges.
 */

/**
 * @typedef {Object} PartialConfig Le type d'une configuration partielle.
 * @prop {string[]|string}                               patterns    Les motifs
 *                                                                   des
 *                                                                   fichiers à
 *                                                                   analyser.
 * @prop {boolean}                                       [fix]       La marque
 *                                                                   indiquant
 *                                                                   s'il faut
 *                                                                   corriger
 *                                                                   les
 *                                                                   fichiers.
 * @prop {PartialConfigLevel}                            [level]     Le niveau
 *                                                                   de sévérité
 *                                                                   minimum des
 *                                                                   notifications.
 * @prop {PartialConfigReporter|PartialConfigReporter[]} [reporters] Les
 *                                                                   configurations
 *                                                                   des
 *                                                                   rapporteurs.
 * @prop {PartialConfigChecker|PartialConfigChecker[]}   [checkers]  Les
 *                                                                   configurations
 *                                                                   des
 *                                                                   checkers.
 */
