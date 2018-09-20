# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from datetime import date

# Create your models here.

class studies(models.Model):
    gsheet_id = models.CharField(max_length=255, default='', blank=True, null=True)
    year_of_publication = models.CharField(max_length=255, default='', blank=True, null=True)
    year_of_publication_number = models.DateField(default=date.today, blank=True, null=True)
    authors = models.CharField(max_length=255, default='', blank=True, null=True)
    country = models.CharField(max_length=255, default='', blank=True, null=True)
    area = models.CharField(max_length=255, default='', blank=True, null=True)
    study_size = models.CharField(max_length=255, default='', blank=True, null=True)
    study_size_number = models.IntegerField(default=0, blank=True, null=True)
    age = models.CharField(max_length=255, default='', blank=True, null=True)
    number_affected = models.CharField(max_length=255, default='', blank=True, null=True)
    diagnostic_criteria = models.CharField(max_length=255, default='', blank=True, null=True)
    pct_with_normal_iq = models.CharField(max_length=255, default='', blank=True, null=True)
    gender_ratio = models.CharField(max_length=255, default='', blank=True, null=True)
    prevalence_rate = models.CharField(max_length=255, default='', blank=True, null=True)
    prevalence_rate_number = models.FloatField(default=0, blank=True, null=True)
    confidence_interval = models.CharField(max_length=255, default='', blank=True, null=True)
    category = models.CharField(max_length=255, default='', blank=True, null=True)
    time_period_studied = models.CharField(max_length=255, default='', blank=True, null=True)
    time_period_studied_number_min = models.DateField(default=date.today, blank=True, null=True)
    time_period_studied_number_max = models.DateField(default=date.today, blank=True, null=True)
    reliability_quality = models.CharField(max_length=255, default='', blank=True, null=True)
    methodology = models.CharField(max_length=255, default='', blank=True, null=True)
    mean_income_of_participants = models.CharField(max_length=255, default='', blank=True, null=True)
    education_level_of_participants = models.CharField(max_length=255, default='', blank=True, null=True)
    citation = models.CharField(max_length=255, default='', blank=True, null=True)
    url = models.CharField(max_length=255, default='', blank=True, null=True)
    link_to_news_coverage_by_spectrum = models.CharField(max_length=255, default='', blank=True, null=True)
    erics_quality_assessment = models.CharField(max_length=255, default='', blank=True, null=True)
    erics_reasons_for_lower_quality = models.CharField(max_length=255, default='', blank=True, null=True)
    latitude = models.FloatField(default=None, blank=True, null=True)
    longitude = models.FloatField(default=None, blank=True, null=True)