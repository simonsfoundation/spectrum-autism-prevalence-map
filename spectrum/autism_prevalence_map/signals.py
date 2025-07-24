import CloudFlare
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.admin.models import LogEntry

def purge_cloudflare_cache(subdomain):
    try:
        cf = CloudFlare.CloudFlare(token=settings.CLOUDFLARE_API_TOKEN)
        purge_data = {'hosts': [subdomain]}
        cf.zones.purge_cache.post(settings.CLOUDFLARE_ZONE_ID, data=purge_data)
    except CloudFlare.exceptions.CloudFlareAPIError as e:
        pass
    except Exception as e:
        pass

@receiver(post_save)
def clear_cache_on_save(sender, instance, **kwargs):
    if LogEntry.objects.filter(
        object_id=str(instance.pk),
        content_type_id__model=sender.__name__.lower()
    ).exists():
        purge_cloudflare_cache(settings.CLOUDFLARE_SUBDOMAIN)