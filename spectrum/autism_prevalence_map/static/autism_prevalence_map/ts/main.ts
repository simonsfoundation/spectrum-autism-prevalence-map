import { ttInitTopo } from '../vendor/js/topojson.js';
import { ttInitArray } from '../vendor/js/d3-array.v1.min.js';
import { ttInitGeo } from '../vendor/js/d3-geo.v1.min.js';
import { ttInitProjection } from '../vendor/js/d3-geo-projection.v2.min.js';

import { ttInitJoint } from './joint.ts';
import { ttInitMap } from './map.ts';
import { ttInitMobilePopup } from './mobile-popup.ts';
import { ttInitList } from './list.ts';
import { ttInitMean } from './mean.ts';

(function ($): void {
    $(function () {
        const pageName = document.body.dataset.page || '';

        ttInitTopo();
        ttInitArray();
        ttInitGeo();
        ttInitProjection();
        ttInitJoint();
        ttInitMobilePopup();
        ttInitMean();

        switch (pageName) {
            case 'map':
                ttInitMap();
                break;
            case 'list':
                ttInitList();
                break;
        }
    });
})(jQuery);
