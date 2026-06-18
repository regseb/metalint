/**
 * @license MIT
 * @author Sébastien Règne
 */

/* @ts-self-types="../../../types/core/configuration/partial.d.ts" */

/**
 * @import { TypeofFormatter } from "../formatter/formatter.js"
 * @import { Level } from "../levels.js"
 * @import { TypeofWrapper } from "../wrapper/wrapper.js"
 */

/**
 * Le type d'un niveau partiel.
 *
 * @typedef {Level | "OFF" | "FATAL" | "ERROR" | "WARN" | "INFO"} PartialConfigLevel
 */

/**
 * Le type des options partielles d'un formateur ou d'un linter.
 *
 * @typedef {Record<string, unknown> | string} PartialConfigOption
 */

/**
 * Le type d'une configuration partielle d'un rapporteur.
 *
 * @typedef {Object} PartialConfigReporter
 * @prop {TypeofFormatter | string}                    formatter La classe du
 *                                                               formateur.
 * @prop {PartialConfigLevel}                          [level]   Le niveau de
 *                                                               sévérité
 *                                                               minimum des
 *                                                               notifications
 *                                                               affichées.
 * @prop {PartialConfigOption | PartialConfigOption[]} [options] Les options du
 *                                                               formateur.
 */

/**
 * Le type d'une configuration partielle détaillée d'un linter.
 *
 * @typedef {Object} PartialConfigLinterObject
 * @prop {TypeofWrapper | string}                      wrapper   La classe de
 *                                                               l'enrobage.
 * @prop {boolean}                                     [fix]     La marque
 *                                                               indiquant s'il
 *                                                               faut corriger
 *                                                               les fichiers.
 * @prop {PartialConfigLevel}                          [level]   Le niveau de
 *                                                               sévérité
 *                                                               minimum des
 *                                                               notifications
 *                                                               retournées.
 * @prop {PartialConfigOption | PartialConfigOption[]} [options] Les options du
 *                                                               linter.
 */

/**
 * Le type d'une configuration partielle d'un linter.
 *
 * @typedef {string | PartialConfigLinterObject} PartialConfigLinter
 */

/**
 * Le type d'une configuration partielle d'une surcharge.
 *
 * @typedef {Object} PartialConfigOverride
 * @prop {string[] | string}                           patterns Les motifs des
 *                                                              fichiers à
 *                                                              analyser.
 * @prop {boolean}                                     [fix]    La marque
 *                                                              indiquant s'il
 *                                                              faut corriger
 *                                                              les fichiers.
 * @prop {PartialConfigLevel}                          [level]  Le niveau de
 *                                                              sévérité minimum
 *                                                              des
 *                                                              notifications
 *                                                              retournées.
 * @prop {PartialConfigLinter | PartialConfigLinter[]} linters  Les
 *                                                              configurations
 *                                                              des linters.
 */

/**
 * Le type d'une configuration partielle d'un checker.
 *
 * @typedef {Object} PartialConfigChecker
 * @prop {string[] | string}                               patterns    Les
 *                                                                     motifs
 *                                                                     des
 *                                                                     fichiers
 *                                                                     à
 *                                                                     analyser.
 * @prop {boolean}                                         [fix]       La marque
 *                                                                     indiquant
 *                                                                     s'il faut
 *                                                                     corriger
 *                                                                     les
 *                                                                     fichiers.
 * @prop {PartialConfigLevel}                              [level]     Le niveau
 *                                                                     de
 *                                                                     sévérité
 *                                                                     minimum
 *                                                                     des
 *                                                                     notifications
 *                                                                     retournées.
 * @prop {PartialConfigLinter | PartialConfigLinter[]}     [linters]   Les
 *                                                                     configurations
 *                                                                     des
 *                                                                     linters.
 * @prop {PartialConfigOverride | PartialConfigOverride[]} [overrides] Les
 *                                                                     configurations
 *                                                                     des
 *                                                                     surcharges.
 */

/**
 * Le type d'une configuration partielle.
 *
 * @typedef {Object} PartialConfig
 * @prop {string[] | string}                               patterns    Les
 *                                                                     motifs
 *                                                                     des
 *                                                                     fichiers
 *                                                                     à
 *                                                                     analyser.
 * @prop {boolean}                                         [fix]       La marque
 *                                                                     indiquant
 *                                                                     s'il faut
 *                                                                     corriger
 *                                                                     les
 *                                                                     fichiers.
 * @prop {PartialConfigLevel}                              [level]     Le niveau
 *                                                                     de
 *                                                                     sévérité
 *                                                                     minimum
 *                                                                     des
 *                                                                     notifications.
 * @prop {PartialConfigReporter | PartialConfigReporter[]} [reporters] Les
 *                                                                     configurations
 *                                                                     des
 *                                                                     rapporteurs.
 * @prop {PartialConfigChecker | PartialConfigChecker[]}   [checkers]  Les
 *                                                                     configurations
 *                                                                     des
 *                                                                     checkers.
 */
