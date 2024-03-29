/*
Copyright (C) 2006 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Contains utility functions for parsing XML entities. In
 * particular, includes a table of the most common HTML entities.
 *
 * This file is meant to run as part of the Trekker Google Desktop gadget,
 * but is decoupled enough to be reusable in other JavaScript environments.
 *
 * @see #ENT_htmlDecode
 */

// Regular expression that matches well-formed XML entities (in particular,
// their name, i.e., the part betwen & and ;)
var ENTITIES_REGEXP = /&([^;]+);/g;

// Common HTML entities: map of (entity name) -> (Unicode character code).
// From http://www.htmlhelp.com/reference/html40/entities/
// ("Latin-1 Entities" and "Other Special Characters" only)
var ENTITIES_MAP = {
  'nbsp' : 160,
  'iexcl' : 161,
  'cent' : 162,
  'pound' : 163,
  'curren' : 164,
  'yen' : 165,
  'brvbar' : 166,
  'sect' : 167,
  'uml' : 168,
  'copy' : 169,
  'ordf' : 170,
  'laquo' : 171,
  'not' : 172,
  'shy' : 173,
  'reg' : 174,
  'macr' : 175,
  'deg' : 176,
  'plusmn' : 177,
  'sup2' : 178,
  'sup3' : 179,
  'acute' : 180,
  'micro' : 181,
  'para' : 182,
  'middot' : 183,
  'cedil' : 184,
  'sup1' : 185,
  'ordm' : 186,
  'raquo' : 187,
  'frac14' : 188,
  'frac12' : 189,
  'frac34' : 190,
  'iquest' : 191,
  'Agrave' : 192,
  'Aacute' : 193,
  'Acirc' : 194,
  'Atilde' : 195,
  'Auml' : 196,
  'Aring' : 197,
  'AElig' : 198,
  'Ccedil' : 199,
  'Egrave' : 200,
  'Eacute' : 201,
  'Ecirc' : 202,
  'Euml' : 203,
  'Igrave' : 204,
  'Iacute' : 205,
  'Icirc' : 206,
  'Iuml' : 207,
  'ETH' : 208,
  'Ntilde' : 209,
  'Ograve' : 210,
  'Oacute' : 211,
  'Ocirc' : 212,
  'Otilde' : 213,
  'Ouml' : 214,
  'times' : 215,
  'Oslash' : 216,
  'Ugrave' : 217,
  'Uacute' : 218,
  'Ucirc' : 219,
  'Uuml' : 220,
  'Yacute' : 221,
  'THORN' : 222,
  'szlig' : 223,
  'agrave' : 224,
  'aacute' : 225,
  'acirc' : 226,
  'atilde' : 227,
  'auml' : 228,
  'aring' : 229,
  'aelig' : 230,
  'ccedil' : 231,
  'egrave' : 232,
  'eacute' : 233,
  'ecirc' : 234,
  'euml' : 235,
  'igrave' : 236,
  'iacute' : 237,
  'icirc' : 238,
  'iuml' : 239,
  'eth' : 240,
  'ntilde' : 241,
  'ograve' : 242,
  'oacute' : 243,
  'ocirc' : 244,
  'otilde' : 245,
  'ouml' : 246,
  'divide' : 247,
  'oslash' : 248,
  'ugrave' : 249,
  'uacute' : 250,
  'ucirc' : 251,
  'uuml' : 252,
  'yacute' : 253,
  'thorn' : 254,
  'yuml' : 255,
  'quot' : 34,
  'amp' : 38,
  'lt' : 60,
  'gt' : 62,
  'OElig' : 338,
  'oelig' : 339,
  'Scaron' : 352,
  'scaron' : 353,
  'Yuml' : 376,
  'circ' : 710,
  'tilde' : 732,
  'ensp' : 8194,
  'emsp' : 8195,
  'thinsp' : 8201,
  'zwnj' : 8204,
  'zwj' : 8205,
  'lrm' : 8206,
  'rlm' : 8207,
  'ndash' : 8211,
  'mdash' : 8212,
  'lsquo' : 8216,
  'rsquo' : 8217,
  'sbquo' : 8218,
  'ldquo' : 8220,
  'rdquo' : 8221,
  'bdquo' : 8222,
  'dagger' : 8224,
  'Dagger' : 8225,
  'permil' : 8240,
  'lsaquo' : 8249,
  'rsaquo' : 8250,
  'euro' : 8364
};

/**
 * Utility function for the regular expression that matches entity names.
 * Converts the entity name to the actual character.
 *
 * @param {String} m Entire regular expression match, e.g. "&lt;"
 * @param {String} n First captured match, the entity name, e.g. "lt"
 * @return {String} The character corresponding to the entity, e.g. "<"
 * @see String.replace
 */
function ENT_entityToChar(m, n) {
  // Determine the character code of the entity. Range is 0 to 65535
  // (characters in JavaScript are Unicode, and entities can represent
  // Unicode characters).
  var code;

  // Try to parse as numeric entity. This is done before named entities for
  // speed because associative array lookup in many JavaScript implementations
  // is a linear search.
  if (n.substr(0, 1) == '#') {
    // Try to parse as numeric entity
    if (n.substr(1, 1) == 'x') {
      // Try to parse as hexadecimal
      code = parseInt(n.substr(2), 16);
    } else {
      // Try to parse as decimal
      code = parseInt(n.substr(1), 10);
    }
  } else {
    // Try to parse as named entity
    code = ENTITIES_MAP[n];
  }
  
  // If still nothing, pass entity through
  return (code === undefined || code === NaN) ?
      '&' + n + ';' : String.fromCharCode(code);
}

/**
 * Utility function that uses a table of the most common HTML entities to
 * perform XML entity decoding.
 *
 * @string {String} str XML string on which to perform entity decoding
 * @return {String} Decoded string with native characters instead of entities
 */
function ENT_htmlDecode(str) {
  return str.replace(ENTITIES_REGEXP, ENT_entityToChar);
}

// Test
//WScript.Echo(ENT_htmlDecode('abc&nbsp;&uuml;&#x30;def'));
