'use strict';

const { getLocale } = require('./locales');

/**
 * Template Helper
 * Provides utilities for working with templates and locales
 */
class TemplateHelper {
    /**
     * Interpolate template string with data
     * Replaces {key} placeholders with values from data object
     * 
     * @param {string} template - Template string with {placeholders}
     * @param {Object} data - Data object with values
     * @returns {string} Interpolated string
     * 
     * @example
     * interpolate('Hello {name}!', { name: 'John' }) // 'Hello John!'
     */
    static interpolate(template, data = {}) {
        if (!template) return '';
        
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data.hasOwnProperty(key) ? data[key] : match;
        });
    }

    /**
     * Get text from locale
     * @param {string} locale - Locale code ('he', 'en')
     * @param {string} path - Dot notation path to text (e.g., 'welcome.singleTitle')
     * @returns {string|Object} Text or text object
     */
    static getText(locale, path) {
        const localeData = getLocale(locale);
        const keys = path.split('.');
        
        let result = localeData;
        for (const key of keys) {
            if (result && result.hasOwnProperty(key)) {
                result = result[key];
            } else {
                return null;
            }
        }
        
        return result;
    }

    /**
     * Get and interpolate text from locale
     * @param {string} locale - Locale code
     * @param {string} path - Dot notation path to text
     * @param {Object} data - Data for interpolation
     * @returns {string} Interpolated text
     */
    static getInterpolatedText(locale, path, data = {}) {
        const template = this.getText(locale, path);
        if (!template || typeof template !== 'string') {
            return '';
        }
        return this.interpolate(template, data);
    }

    /**
     * Select encouragement level based on score/value
     * @param {number} value - Value to evaluate
     * @param {Object} thresholds - Threshold object { huge: 100, great: 50, good: 0 }
     * @returns {string} Encouragement level key
     */
    static selectEncouragement(value, thresholds = { huge: 100, great: 50, good: 0 }) {
        if (value >= thresholds.huge) return 'huge';
        if (value >= thresholds.great) return 'great';
        return 'good';
    }

    /**
     * Format list of names with proper conjunction
     * @param {Array<string>} names - Array of names
     * @param {string} locale - Locale code
     * @returns {string} Formatted name list
     */
    static formatNameList(names, locale = 'he') {
        if (!names || names.length === 0) return '';
        if (names.length === 1) return names[0];
        
        const conjunction = this.getText(locale, 'common.and') || 'and';
        
        if (names.length === 2) {
            return `${names[0]} ${conjunction} ${names[1]}`;
        }
        
        const lastTwo = `${names[names.length - 2]} ${conjunction} ${names[names.length - 1]}`;
        return names.slice(0, -2).concat(lastTwo).join(', ');
    }

    /**
     * Build message from template sections
     * @param {Array<string>} sections - Array of message sections
     * @returns {string} Combined message
     */
    static buildMessage(sections) {
        return sections.filter(s => s).join('\n\n');
    }
}

module.exports = TemplateHelper;




