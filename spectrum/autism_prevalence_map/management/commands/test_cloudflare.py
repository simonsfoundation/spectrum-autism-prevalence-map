# autism_prevalence_map/management/commands/test_cloudflare.py
from django.core.management.base import BaseCommand
import CloudFlare
from django.conf import settings

class Command(BaseCommand):
    help = 'Test Cloudflare API connection and simulate cache purge'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Simulate purge without actually purging')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        try:
            cf = CloudFlare.CloudFlare(token=settings.CLOUDFLARE_API_TOKEN)
            zones = cf.zones.get()
            self.stdout.write(f"Connected to Cloudflare. Found zones: {[zone['name'] for zone in zones]}")
            if dry_run:
                self.stdout.write('Dry-run mode: Simulating cache purge...')
                purge_data = {'hosts': [settings.CLOUDFLARE_SUBDOMAIN]}
                self.stdout.write(f"Would purge cache for: {purge_data}")
            else:
                self.stdout.write('Dry-run not enabled. No purge executed.')
        except CloudFlare.exceptions.CloudFlareAPIError as e:
            self.stderr.write(f"Cloudflare API error: {e}")
        except Exception as e:
            self.stderr.write(f"Unexpected error: {e}")