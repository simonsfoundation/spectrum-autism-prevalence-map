import { ttInitJoint } from '../js/joint.js';
import { ttInitMap } from '../js/map.js';
import { ttInitList } from '../js/list.js';
import { ttInitAbout } from '../js/about.js';

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