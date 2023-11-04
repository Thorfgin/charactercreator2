import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import ajvErrors from 'ajv-errors';

import {
    test,
    expect
} from '@jest/globals';

// shared
import { getSourceFAQ } from '../src/SharedObjects.js';

// json
import FAQ_schema from './schemas/faq-schema.json';

// globals
const sourceFAQ = getSourceFAQ();

/// --- FORMATTING --- ///
function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv({ allErrors: true });
    ajvKeywords(ajv);
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const result = validate(jsonData)

    if (result === true) { return true; }
    else {
        console.warn("FAQ JSON is not valid:", validate.errors);
        return false;
    }
}

test('FAQ JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourceFAQ, FAQ_schema)).toBe(true);
});