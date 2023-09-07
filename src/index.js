import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Function to handle orientation change
function adjustViewportScale() {
    const viewportMetaTag = document.querySelector('meta[name="viewport"]');
    if (window.matchMedia("(orientation: portrait)").matches) {
        // Portrait orientation: Set initial scale to 1
        viewportMetaTag.setAttribute('content', 'width=device-width, initial-scale=0.6');
    } else if (window.matchMedia("(orientation: landscape)").matches) {
        // Landscape orientation: Set initial scale to a different value
        viewportMetaTag.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
}

// Initial check for orientation
adjustViewportScale();

// Listen for orientation changes
window.addEventListener('resize', adjustViewportScale);

// Function to handle orientation change
function handleOrientationChange() {
    if (window.matchMedia("(orientation: landscape)").matches) {
        // Landscape orientation: Disable scrolling
        document.body.style.overflow = 'auto';
    } else {
        // Portrait orientation: Enable scrolling
        document.body.style.overflow = 'hidden';
    }
}

// Initial check for orientation
handleOrientationChange();

// Listen for orientation changes
window.addEventListener('resize', handleOrientationChange);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();