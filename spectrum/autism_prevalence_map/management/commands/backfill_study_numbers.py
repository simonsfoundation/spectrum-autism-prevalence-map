from django.core.management.base import BaseCommand
from autism_prevalence_map.models import studies

import re

def extract_number(value):
    """
    Converts string like '12,345' or '67%' or '1.2' to float or int
    Returns None if conversion fails.
    """
    if not value:
        return None
    try:
        value_clean = re.sub(r'[^\d.]+', '', value)
        if not value_clean:
            return None
        return float(value_clean)
    except Exception:
        return None

class Command(BaseCommand):
    help = 'Backfill *_number fields on studies model'

    def handle(self, *args, **options):
        total_updated = 0
        for study in studies.objects.all():
            changed = False

            # Backfill individualswithautism_number
            num = extract_number(study.individualswithautism)
            if num is not None and study.individualswithautism_number != num:
                study.individualswithautism_number = int(num)
                changed = True

            # Backfill percentwaverageiq_number
            num = extract_number(study.percentwaverageiq)
            if num is not None and study.percentwaverageiq_number != num:
                study.percentwaverageiq_number = num
                changed = True

            # Backfill sexratiomf_number
            num = extract_number(study.sexratiomf)
            if num is not None and study.sexratiomf_number != num:
                study.sexratiomf_number = num
                changed = True

            if changed:
                study.save()
                total_updated += 1

        self.stdout.write(self.style.SUCCESS(f"Updated {total_updated} study records."))
