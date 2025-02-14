export function ttInitMean() {
    $(document).ready(function (){
        const meanButtonElement = document.querySelector("[data-mean]");
        const meanPopupElement = document.getElementById("mean-popup");
        const popupTextElement = meanPopupElement!.querySelector("[data-id='mean-popup-text']");
        const popupText = "PREVALENCE MEAN ({value}) IS COPIED TO CLIPBOARD";
        let hideTimeout;

        meanButtonElement!.addEventListener("click", function (event) {
            const meanValue = meanButtonElement!.getAttribute("data-mean");
            popupTextElement!.textContent = popupText.replace("{value}", meanValue || "");

            meanPopupElement!.classList.remove("hidden");
            meanPopupElement!.setAttribute("aria-hidden", "false");

            navigator.clipboard.writeText(meanValue!)

            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                hidePopup();
            }, 3000);
        });

        function hidePopup() {
            meanPopupElement!.classList.add("hidden");
            meanPopupElement!.setAttribute("aria-hidden", "true");
        }
    })
}
