import { ttInitJoint } from './joint.ts';
import { ttInitMap } from './map.ts';
import { ttInitList } from './list.ts';
import { ttInitAbout } from './about.ts';

import { ttInitTopo } from '../vendor/js/topojson.js';
import { ttInitArray } from '../vendor/js/d3-array.v1.min.js';
import { ttInitGeo } from '../vendor/js/d3-geo.v1.min.js';
import { ttInitProjection } from '../vendor/js/d3-geo-projection.v2.min.js';

(function ($): void {
    $(function () {
        const pageName = document.body.dataset.page || '';

        switch (pageName) {
            case 'map':
                ttInitTopo();
                ttInitArray();
                ttInitGeo();
                ttInitProjection();
                ttInitJoint();
                ttInitMap();
                break;
            case 'list':
                ttInitTopo();
                ttInitArray();
                ttInitGeo();
                ttInitProjection();
                ttInitJoint();
                initList();
                break;
            case 'about':
                initAbout();
                break;
        }
    });
})(jQuery);