import { useState, useEffect } from 'react';
import urlFAQ from '/json/faq.json?url';
import urlVaardigheden from '/json/vaardigheden.json?url';

// Custom hooks for JSON data sources
export function useSourceFAQ() {
    return usePublicJson(urlFAQ).then(data => data);
}

export function useSourceSkills() {
    return usePublicJson(urlVaardigheden).then(data => data);
}

// Allows for reading JSON in the public folder
function usePublicJson(url) {
    return fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });
}