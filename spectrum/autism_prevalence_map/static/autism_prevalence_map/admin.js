// autism_prevalence_map/static/autism_prevalence_map/admin.js
(function($) {
    jQuery(document).ready(function($) {
        function toggleFields($row, sectionType) {
            // Find fields within the current row (tr.form-row)
            var $titleField = $row.find('td.field-title');
            var $contentField = $row.find('td.field-content');
            // Target the LinkInline that is a direct child of the current row
            var $linksField = $row.find('> .inline-related:has(.field-link_text)');

            console.log('Toggling fields for row:', $row, 'Section Type:', sectionType);
            console.log('Title Field:', $titleField);
            console.log('Content Field:', $contentField);
            console.log('Links Field:', $linksField);

            if (sectionType === 'text') {
                $titleField.hide();
                $contentField.show();
                $linksField.hide();
            } else if (sectionType === 'toc') {
                $titleField.show();
                $contentField.hide();
                $linksField.show();
            }
        }

        // Handle existing rows
        $('.form-row:has(.field-section_type)').each(function() {
            var $row = $(this);
            var sectionType = $row.find('select[name$="-section_type"]').val();
            console.log('Initializing existing row:', $row);
            toggleFields($row, sectionType);
        });

        // Handle section_type changes with a more specific selector
        $(document).on('change', '.form-row select[name$="-section_type"]', function() {
            var $row = $(this).closest('.form-row');
            var sectionType = $(this).val(); // Get the value directly from the changed element
            console.log('Section type changed:', sectionType);
            toggleFields($row, sectionType);
        });

        // Handle dynamically added rows with a slight delay
        $(document).on('formset:added', function(event, $row, formsetName) {
            if (formsetName === 'sections') { // Match the formset name used in the DOM
                console.log('New row added:', $row);
                setTimeout(function() {
                    var sectionType = $row.find('select[name$="-section_type"]').val();
                    toggleFields($row, sectionType);
                }, 100); // Small delay to ensure DOM is fully updated
            }
        });
    });
})(django.jQuery);