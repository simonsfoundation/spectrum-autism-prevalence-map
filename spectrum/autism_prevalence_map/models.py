# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from datetime import date

# Create your models here.

class studies(models.Model):
    gsheet_id = models.CharField(max_length=255, default='', blank=True, null=True)
    yearpublished = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Year Published')
    yearpublished_number = models.DateField(default=date.today, blank=True, null=True)
    authors = models.CharField(max_length=255, default='', blank=True, null=True)
    country = models.CharField(max_length=255, default='', blank=True, null=True)
    area = models.CharField(max_length=255, default='', blank=True, null=True)
    samplesize = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Sample Size')
    samplesize_number = models.IntegerField(default=0, blank=True, null=True)
    age = models.CharField(max_length=255, default='', blank=True, null=True)
    individualswithautism = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Individual with Autism')
    diagnosticcriteria = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Diagnostic Criteria')
    diagnostictools = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Diagnostic Tools')
    percentwaverageiq = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Percent w/ Average IQ')
    sexratiomf = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Sex ratio (M:F)')
    prevalenceper10000 = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Prevalence (per 10,000)')
    prevalenceper10000_number = models.FloatField(default=0, blank=True, null=True)
    confidenceinterval = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='95% Confidence interval')
    categoryadpddorasd = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Category (AD, PDD or ASD)')
    yearsstudied = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Year(s) Studied')
    yearsstudied_number_min = models.DateField(default=date.today, blank=True, null=True)
    yearsstudied_number_max = models.DateField(default=date.today, blank=True, null=True)
    num_yearsstudied = models.IntegerField(default=0, blank=True, null=True)
    recommended = models.CharField(max_length=255, default='', blank=True, null=True)
    studytype = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Study Type')
    meanincomeofparticipants = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Income')
    educationlevelofparticipants = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Education')
    citation = models.CharField(max_length=255, default='', blank=True, null=True)
    link1title = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 1 Title')
    link1url = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 1 Url')
    link2title = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 2 Title')
    link2url = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 2 Url')
    link3title = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 3 Title')
    link3url = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 3 Url')
    link4title = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 4 Title')
    link4url = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Link 4 Url')
    latitude = models.FloatField(default=None, blank=True, null=True)
    longitude = models.FloatField(default=None, blank=True, null=True)