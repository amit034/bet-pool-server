'use strict';

/**
 * Locale Index
 * Provides access to all locale files
 */

const he = require('./he');
const en = require('./en');

const locales = {
    he,
    en
};

/**
 * Get locale data
 * @param {string} locale - Locale code ('he', 'en')
 * @returns {Object} Locale data
 */
function getLocale(locale = 'he') {
    return locales[locale] || locales.he; // Default to Hebrew
}

/**
 * Get all available locales
 * @returns {Array<string>} Array of locale codes
 */
function getAvailableLocales() {
    return Object.keys(locales);
}

module.exports = {
    getLocale,
    getAvailableLocales,
    locales
};




