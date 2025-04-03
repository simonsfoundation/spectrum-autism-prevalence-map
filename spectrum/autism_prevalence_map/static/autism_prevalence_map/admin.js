(function($) {
    jQuery(document).ready(function($) {
        // Add labels above each field, but only if they haven't been added yet
        function addFieldLabels($row) {
            // In StackedInline, fields are in div.form-row
            if ($row.find('div.field-section_type label').length === 0) {
                $row.find('div.field-section_type').prepend('<label>Section Type</label>');
                $row.find('div.field-title').prepend('<label>Title</label>');
                $row.find('div.field-content').prepend('<label>Content</label>');
                $row.find('div.field-links').prepend('<label>Links</label>');
                $row.find('div.field-order').prepend('<label>Order</label>');
            }
        }

        function toggleFields($row, sectionType) {
            var $titleField = $row.find('div.field-title');
            var $contentField = $row.find('div.field-content');
            var $linksField = $row.find('div.field-links');

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
        $('.inline-related:has(.field-section_type)').each(function() {
            var $row = $(this);
            addFieldLabels($row);
            var sectionType = $row.find('select[name$="-section_type"]').val();
            console.log('Initializing existing row:', $row);
            toggleFields($row, sectionType);
        });

        // Handle section_type changes
        $(document).on('change', 'select[name$="-section_type"]', function() {
            var $row = $(this).closest('.inline-related');
            var sectionType = $(this).val();
            console.log('Section type changed:', sectionType);
            toggleFields($row, sectionType);
        });

        // Handle dynamically added rows
        $(document).on('formset:added', function(event, $row, formsetName) {
            if (formsetName === 'sections') {
                console.log('New row added:', $row);
                setTimeout(function() {
                    addFieldLabels($row);
                    var sectionType = $row.find('select[name$="-section_type"]').val();
                    toggleFields($row, sectionType);
                }, 100);
            }
        });
    });
})(django.jQuery);