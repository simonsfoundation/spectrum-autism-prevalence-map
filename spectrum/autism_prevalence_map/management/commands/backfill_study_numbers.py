from django.core.management.base import BaseCommand
from autism_prevalence_map.models import studies
import re

class Command(BaseCommand):
    help = 'Backfill numeric fields for studies model'

    def handle(self, *args, **kwargs):
        count = 0

        for study in studies.objects.all():
            updated = False

            # individualswithautism_number
            try:
                if study.individualswithautism:
                    value = re.sub(r'[^\d]', '', study.individualswithautism)
                    study.individualswithautism_number = int(value) if value else None
                    updated = True
            except Exception:
                pass

            # percentwaverageiq_number
            try:
                if study.percentwaverageiq:
                    match = re.search(r'[-+]?\d*\.?\d+', study.percentwaverageiq)
                    study.percentwaverageiq_number = float(match.group()) if match else None
                    updated = True
            except Exception:
                pass

            # sexratiomf_number
            try:
                if study.sexratiomf:
                    match = re.search(r'[-+]?\d*\.?\d+', study.sexratiomf)
                    study.sexratiomf_number = float(match.group()) if match else None
                    updated = True
            except Exception:
                pass

            # confidenceinterval_low + confidenceinterval_high
            try:
                if study.confidenceinterval:
                    nums = re.findall(r'[-+]?\d*\.?\d+', study.confidenceinterval)
                    if len(nums) >= 2:
                        study.confidenceinterval_low = float(nums[0])
                        study.confidenceinterval_high = float(nums[1])
                        updated = True
                    elif len(nums) == 1:
                        study.confidenceinterval_low = float(nums[0])
                        study.confidenceinterval_high = float(nums[0])
                        updated = True
            except Exception:
                pass

            # age_low + age_high
            try:
                if study.age:
                    nums = re.findall(r'[-+]?\d*\.?\d+', study.age)
                    if len(nums) >= 2:
                        study.age_low = float(nums[0])
                        study.age_high = float(nums[1])
                        updated = True
                    elif len(nums) == 1:
                        study.age_low = float(nums[0])
                        study.age_high = float(nums[0])
                        updated = True
            except Exception:
                pass

            if updated:
                study.save()
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} study records.'))
