import CloudFlare
import logging
import os
from django.conf import settings
from django.db.models.signals import post_save
from django.contrib.admin.models import LogEntry

from .models import (
    studies, options, AboutPage, AboutSection,
    Footer, FooterLeftMenuItem, FooterRightMenuItem,
)

logger = logging.getLogger(__name__)

def purge_cloudflare_cache(subdomain):
    # Check if Cloudflare settings are configured
    if not all([settings.CLOUDFLARE_API_TOKEN, settings.CLOUDFLARE_ZONE_ID, subdomain]):
        logger.warning("Cloudflare settings not fully configured, skipping cache purge")
        return False
    
    try:
        cf = CloudFlare.CloudFlare(token=settings.CLOUDFLARE_API_TOKEN)
        purge_data = {'hosts': [subdomain]}
        result = cf.zones.purge_cache.post(settings.CLOUDFLARE_ZONE_ID, data=purge_data)
        logger.info(f"Successfully purged Cloudflare cache for {subdomain}")
        return True
    except CloudFlare.exceptions.CloudFlareAPIError as e:
        logger.error(f"Cloudflare API error during cache purge: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during Cloudflare cache purge: {e}")
        return False

# Public-facing content models whose edits should invalidate the CDN cache. Scoping the
# receiver to these (rather than a global post_save) keeps it from firing on auth/session/
# admin-log rows, so `migrate` never queries LogEntry on an empty database.
CACHED_CONTENT_MODELS = (
    studies, options, AboutPage, AboutSection,
    Footer, FooterLeftMenuItem, FooterRightMenuItem,
)


def clear_cache_on_save(sender, instance, **kwargs):
    # Skip the LogEntry query when Cloudflare isn't configured (e.g. local/dev).
    if not all([settings.CLOUDFLARE_API_TOKEN, settings.CLOUDFLARE_ZONE_ID, settings.CLOUDFLARE_SUBDOMAIN]):
        return
    if LogEntry.objects.filter(
        object_id=str(instance.pk),
        content_type_id__model=sender.__name__.lower()
    ).exists():
        purge_cloudflare_cache(settings.CLOUDFLARE_SUBDOMAIN)


for _model in CACHED_CONTENT_MODELS:
    post_save.connect(clear_cache_on_save, sender=_model)
