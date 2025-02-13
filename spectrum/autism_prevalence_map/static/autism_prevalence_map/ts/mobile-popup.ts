export function ttInitMobilePopup() {
    $(document).ready(function () {
        const mobilePopup = document.getElementById('mobile-popup');
        if (window.innerWidth <= 1280 && mobilePopup) {
            mobilePopup.classList.remove('hidden');
            document.documentElement.classList.add('overflow-hidden');
            document.body.classList.add('overflow-hidden');
        }
    });
}
