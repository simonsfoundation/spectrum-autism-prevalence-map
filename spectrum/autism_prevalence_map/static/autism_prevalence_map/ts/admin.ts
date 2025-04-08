(function ($) {
    jQuery(document).ready(function ($) {
        // add labels above each field, but only if they haven't been added yet
        function addFieldLabels($row) {
            if ($row.find('div.field-section_type label').length === 0) {
                $row.find('div.field-section_type').prepend('<label>Section Type</label>');
                $row.find('div.field-title').prepend('<label>Title</label>');
                $row.find('div.field-content').prepend('<label>Content</label>');
                $row.find('div.field-newsletter_title').prepend('<label>Newsletter Title</label>');
                $row.find('div.field-newsletter_support_line').prepend('<label>Newsletter Support Line</label>');
                $row.find('div.field-links').prepend('<label>Links</label>');
                $row.find('div.field-order').prepend('<label>Order</label>');
            }
        }

        // control what fields are showing based on the section type selection
        function toggleFields($row, sectionType) {
            var $titleField = $row.find('div.field-title');
            var $contentField = $row.find('div.field-content');
            var $newsletterTitleField = $row.find('div.field-newsletter_title');
            var $newsletterSupportLineField = $row.find('div.field-newsletter_support_line');
            var $linksField = $row.find('div.field-links');

            if (sectionType === 'text' || sectionType === 'callout') {
                $titleField.hide();
                $contentField.show();
                $newsletterTitleField.hide();
                $newsletterSupportLineField.hide();
                $linksField.hide();
            } else if (sectionType === 'toc') {
                $titleField.show();
                $contentField.hide();
                $newsletterTitleField.hide();
                $newsletterSupportLineField.hide();
                $linksField.show();
            } else if (sectionType === 'newsletter') {
                $titleField.hide();
                $contentField.hide();
                $newsletterTitleField.show();
                $newsletterSupportLineField.show();
                $linksField.hide();
            }
        }

        // existing rows
        $('.inline-related:has(.field-section_type)').each(function () {
            var $row = $(this);
            addFieldLabels($row);
            var sectionType = $row.find('select[name$="-section_type"]').val();
            toggleFields($row, sectionType);
        });

        // section_type changes
        $(document).on('change', 'select[name$="-section_type"]', function () {
            var $row = $(this).closest('.inline-related');
            var sectionType = $(this).val();
            toggleFields($row, sectionType);
        });

        // dynamically added rows
        $(document).on('formset:added', function (event, $row, formsetName) {
            if (formsetName === 'sections') {
                setTimeout(function () {
                    addFieldLabels($row);
                    var sectionType = $row.find('select[name$="-section_type"]').val();
                    toggleFields($row, sectionType);
                }, 100);
            }
        });
    });
})(django.jQuery);
