export function ttInitKeywordsSearchInput() {
    $(document).ready(function () {
        const searchInput: HTMLInputElement = document.querySelector('[data-id="keyword-filter-input"]') as HTMLInputElement;
        const clearButton: HTMLButtonElement = document.querySelector('[data-id="keyword-filter-clear-btn"]') as HTMLButtonElement;

        if (!searchInput || !clearButton) return;

        function toggleClearButton() {
            if (searchInput!.value.trim().length > 0) {
                if (clearButton.classList.contains('hidden')) {
                    clearButton.classList.remove('hidden');
                }
            } else {
                if (!clearButton.classList.contains('hidden')) {
                    clearButton.classList.add('hidden');
                }
            }
        }

        searchInput.addEventListener('input', toggleClearButton);

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            toggleClearButton();
            searchInput.focus();
        });
    });
}