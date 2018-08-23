# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class studies(models.Model):
    gsheet_id = models.CharField(max_length=255, default='', blank=True, null=True)
    year = models.CharField(max_length=255, default='', blank=True, null=True)
    authors = models.CharField(max_length=255, default='', blank=True, null=True)
    country = models.CharField(max_length=255, default='', blank=True, null=True)
    area = models.CharField(max_length=255, default='', blank=True, null=True)
    population = models.CharField(max_length=255, default='', blank=True, null=True)
    age = models.CharField(max_length=255, default='', blank=True, null=True)
    number_affected = models.CharField(max_length=255, default='', blank=True, null=True)
    diagnostic_criteria = models.CharField(max_length=255, default='', blank=True, null=True)
    pct_with_normal_iq = models.CharField(max_length=255, default='', blank=True, null=True)
    gender_ratio = models.CharField(max_length=255, default='', blank=True, null=True)
    prevalence_rate = models.CharField(max_length=255, default='', blank=True, null=True)
    confidence_interval = models.CharField(max_length=255, default='', blank=True, null=True)
    latitude = models.FloatField(default=None, blank=True, null=True)
    longitude = models.FloatField(default=None, blank=True, null=True)