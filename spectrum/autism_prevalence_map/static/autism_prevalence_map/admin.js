(function($) {
    jQuery(document).ready(function($) {
        // Remove the table header
        $('table#sections thead').hide();

        // Add labels above each field, but only if they haven't been added yet
        function addFieldLabels($row) {
            // Check if labels have already been added to this row
            if ($row.find('td.field-section_type label').length === 0) {
                $row.find('td.field-section_type').prepend('<label>Section Type</label>');
                $row.find('td.field-title').prepend('<label>Title</label>');
                $row.find('td.field-content').prepend('<label>Content</label>');
                $row.find('td.field-order').prepend('<label>Order</label>');
                // Hide the label for the delete column
                $row.find('td.delete').prepend('<label style="display: none;">Delete?</label>');
            }
        }

        function toggleFields($row, sectionType) {
            var $titleField = $row.find('td.field-title');
            var $contentField = $row.find('td.field-content');
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
            addFieldLabels($row);
            var sectionType = $row.find('select[name$="-section_type"]').val();
            console.log('Initializing existing row:', $row);
            toggleFields($row, sectionType);
        });

        // Handle section_type changes
        $(document).on('change', '.form-row select[name$="-section_type"]', function() {
            var $row = $(this).closest('.form-row');
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