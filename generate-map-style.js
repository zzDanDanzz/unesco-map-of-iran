import fs from 'fs';
import path from 'path';

const stylePath = path.resolve('public/style.json');
const style = JSON.parse(fs.readFileSync(stylePath, 'utf8'));

style.sources = {
    'global-tiles': {
        type: 'vector',
        url: 'pmtiles:///global-z0-z4.pmtiles',
        maxzoom: 4
    },
    'iran-tiles': {
        type: 'vector',
        url: 'pmtiles:///iran-z5-z10.pmtiles',
        bounds: [44.03, 25.05, 63.33, 39.78]
    }
};

const iranLayers = [];
let transformed = false;

style.layers.forEach(layer => {
    if (layer.source === 'protomaps') {
        transformed = true;
        
        const iranLayer = structuredClone(layer);
        iranLayer.id = layer.id + '-iran';
        iranLayer.source = 'iran-tiles';
        iranLayer.minzoom = 5;

        layer.source = 'global-tiles';

        if (layer.type === 'symbol') {
            layer.maxzoom = 5;
        }

        iranLayers.push(iranLayer);
    }
});

if (transformed) {
    style.layers = [...style.layers, ...iranLayers];
    fs.writeFileSync(stylePath, JSON.stringify(style, null, 2));
    console.log('Successfully mutated public/style.json with combined layers.');
} else {
    fs.writeFileSync(stylePath, JSON.stringify(style, null, 2));
    console.log('No "protomaps" layers found. Sources were updated, but no new layers were cloned.');
}
