export function ttInitMobilePopup() {
    $(document).ready(function () {
        if (window.location.pathname !== '/about/') {
            const mobilePopup = document.getElementById('mobile-popup');
            const closeButton = document.querySelector('[data-id="close-mobile-popup-btn"]');

            if (window.innerWidth < 1280 && mobilePopup) {
                mobilePopup.classList.remove('hidden');
                document.documentElement.classList.add('overflow-hidden');
                document.body.classList.add('overflow-hidden');
            }

            if (closeButton) {
                closeButton.addEventListener('click', function () {
                    mobilePopup!.classList.add('hidden');
                    document.documentElement.classList.remove('overflow-hidden');
                    document.body.classList.remove('overflow-hidden');
                });
            }
        }
    });
}
