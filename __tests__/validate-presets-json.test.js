import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import ajvErrors from 'ajv-errors';

import {
    test,
    expect
} from '@jest/globals';

// shared
import { getPresets } from '../src/SharedObjects.js';

// json
import presets_schema from './schemas/presets-schema.json';

// globals
const sourcePresets = getPresets();

/// --- FORMATTING --- ///
function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv({ allErrors: true });
    ajvKeywords(ajv);
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const result = validate(jsonData)

    if (result === true) { return true; }
    else {
        console.warn("Presets JSON is not valid:", validate.errors);
        return false;
    }
}

test('Presets JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourcePresets, presets_schema)).toBe(true);
});