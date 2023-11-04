import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import ajvErrors from 'ajv-errors';

import {
    test,
    expect
} from '@jest/globals';

// shared
import { getSourceReleaseNotes } from '../src/SharedObjects.js';

// json
import releasenotes_schema from './schemas/releasenotes-schema.json';

// globals
const sourceReleaseNotes = getSourceReleaseNotes();

/// --- FORMATTING --- ///
function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv({ allErrors: true });
    ajvKeywords(ajv);
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const result = validate(jsonData)

    if (result === true) { return true; }
    else {
        console.warn("ReleaseNotes JSON is not valid:", validate.errors);
        return false;
    }
}

test('ReleaseNotes JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourceReleaseNotes, releasenotes_schema)).toBe(true);
});