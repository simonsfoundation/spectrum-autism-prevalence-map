# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import studies

# Register your models here.

@admin.register(studies)
class AdminStudies(admin.ModelAdmin):
    list_display = ("id","yearpublished", "authors", "country", "area", "samplesize", "age", "individualswithautism", "diagnosticcriteria")
    exclude = ('gsheet_id','latitude','longitude','yearpublished_number','yearsstudied_number_min', 'yearsstudied_number_max','prevalenceper10000_number', 'samplesize_number')
    def save_model(self, request, obj, form, change):
        return super().save_model(request, obj, form, change)
