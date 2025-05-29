import CloudFlare
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.admin.models import LogEntry
import logging

logger = logging.getLogger(__name__)

def purge_cloudflare_cache(subdomain):
    try:
        cf = CloudFlare.CloudFlare(token=settings.CLOUDFLARE_API_TOKEN)
        purge_data = {'hosts': [subdomain]}
        response = cf.zones.purge_cache.post(settings.CLOUDFLARE_ZONE_ID, data=purge_data)
        logger.info(f"Cloudflare cache purged for {subdomain}: {response}")
    except CloudFlare.exceptions.CloudFlareAPIError as e:
        logger.error(f"Cloudflare API error during purge: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during purge: {e}")

@receiver(post_save)
def clear_cache_on_save(sender, instance, **kwargs):
    if LogEntry.objects.filter(
        object_id=str(instance.pk),
        content_type_id__model=sender.__name__.lower()
    ).exists():
        logger.info(f"Admin save detected for {sender.__name__}. Triggering cache purge.")
        # this is the actual cache clearing line, above is for testing
        # purge_cloudflare_cache(settings.CLOUDFLARE_SUBDOMAIN)