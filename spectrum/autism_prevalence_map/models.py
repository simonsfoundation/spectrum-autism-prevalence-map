# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from datetime import date

# Create your models here.

class studies(models.Model):
    gsheet_id = models.CharField(max_length=255, default='', blank=True, null=True)
    yearpublished = models.CharField(max_length=255, default='', blank=True, null=True)
    yearpublished_number = models.DateField(default=date.today, blank=True, null=True)
    authors = models.CharField(max_length=255, default='', blank=True, null=True)
    country = models.CharField(max_length=255, default='', blank=True, null=True)
    area = models.CharField(max_length=255, default='', blank=True, null=True)
    samplesize = models.CharField(max_length=255, default='', blank=True, null=True)
    samplesize_number = models.IntegerField(default=0, blank=True, null=True)
    age = models.CharField(max_length=255, default='', blank=True, null=True)
    individualswithautism = models.CharField(max_length=255, default='', blank=True, null=True)
    diagnosticcriteria = models.CharField(max_length=255, default='', blank=True, null=True)
    percentwaverageiq = models.CharField(max_length=255, default='', blank=True, null=True)
    sexratiomf = models.CharField(max_length=255, default='', blank=True, null=True)
    prevalenceper10000 = models.CharField(max_length=255, default='', blank=True, null=True)
    prevalenceper10000_number = models.FloatField(default=0, blank=True, null=True)
    confidenceinterval = models.CharField(max_length=255, default='', blank=True, null=True)
    categoryadpddorasd = models.CharField(max_length=255, default='', blank=True, null=True)
    yearsstudied = models.CharField(max_length=255, default='', blank=True, null=True)
    yearsstudied_number_min = models.DateField(default=date.today, blank=True, null=True)
    yearsstudied_number_max = models.DateField(default=date.today, blank=True, null=True)
    recommended = models.CharField(max_length=255, default='', blank=True, null=True)
    studytype = models.CharField(max_length=255, default='', blank=True, null=True)
    meanincomeofparticipants = models.CharField(max_length=255, default='', blank=True, null=True)
    educationlevelofparticipants = models.CharField(max_length=255, default='', blank=True, null=True)
    citation = models.CharField(max_length=255, default='', blank=True, null=True)
    link1title = models.CharField(max_length=255, default='', blank=True, null=True)
    link1url = models.CharField(max_length=255, default='', blank=True, null=True)
    link2title = models.CharField(max_length=255, default='', blank=True, null=True)
    link2url = models.CharField(max_length=255, default='', blank=True, null=True)
    link3title = models.CharField(max_length=255, default='', blank=True, null=True)
    link3url = models.CharField(max_length=255, default='', blank=True, null=True)
    link4title = models.CharField(max_length=255, default='', blank=True, null=True)
    link4url = models.CharField(max_length=255, default='', blank=True, null=True)
    sourceofdataforthisspreadsheet = models.CharField(max_length=255, default='', blank=True, null=True)
    ericsqualityassessment = models.CharField(max_length=255, default='', blank=True, null=True)
    ericsreasonsbasedonmyrecallofthestudies	 = models.CharField(max_length=255, default='', blank=True, null=True)
    commentsfromotheradvisors = models.CharField(max_length=255, default='', blank=True, null=True)
    latitude = models.FloatField(default=None, blank=True, null=True)
    longitude = models.FloatField(default=None, blank=True, null=True)