# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
from datetime import date
from ckeditor.fields import RichTextField

# Create your models here.

class studies(models.Model):
    class Meta:
        verbose_name = 'Study'
        verbose_name_plural = 'Studies'
        
    gsheet_id = models.CharField(max_length=255, default='', blank=True, null=True)
    yearpublished = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Year Published')
    yearpublished_number = models.DateField(default=date.today, blank=True, null=True)
    authors = models.CharField(max_length=255, default='', blank=True, null=True)
    country = models.CharField(max_length=255, default='', blank=True, null=True)
    area = models.CharField(max_length=255, default='', blank=True, null=True)
    samplesize = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Sample Size')
    samplesize_number = models.IntegerField(default=0, blank=True, null=True)
    age = models.CharField(max_length=255, default='', blank=True, null=True)
    individualswithautism = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Individuals with Autism')
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

class options(models.Model):
    class Meta:
        verbose_name = 'Option'
        verbose_name_plural = 'Options'
    
    name = models.CharField(max_length=255, default='', blank=True, null=True)
    value = models.CharField(max_length=255, default='', blank=True, null=True)

class AboutPage(models.Model):
    class Meta:
        verbose_name = 'About Page'
        verbose_name_plural = 'About Pages'

    title = models.CharField(max_length=255, default='About the Global Autism Prevalence Map', help_text="Main title of the About page")
    meta_title = models.CharField(max_length=255, default='', blank=True, help_text="SEO meta title (up to 60 characters recommended)")
    meta_description = models.TextField(default='', blank=True, help_text="SEO meta description (up to 160 characters recommended)")

    def __str__(self):
        return self.title

class AboutSection(models.Model):
    class Meta:
        verbose_name = 'About Section'
        verbose_name_plural = 'About Sections'

    SECTION_TYPES = (
        ('text', 'Text Block'),
        ('toc', 'Table of Contents'),
    )

    about_page = models.ForeignKey(AboutPage, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES, default='text', help_text="Type of section")
    title = models.CharField(max_length=255, blank=True, help_text="Section title (used for Table of Contents sections)")
    content = RichTextField(blank=True, help_text="Rich text content (used for Text Block sections)")
    order = models.PositiveIntegerField(default=0, help_text="Order of this section")
    links = models.TextField(
        blank=True,
        help_text="Enter links for Table of Contents sections as: link_text|link_url,link_text|link_url"
    )

    def __str__(self):
        return f"{self.title or 'Untitled'} ({self.section_type})"

    class Meta:
        ordering = ['order']

    def get_links(self):
        """Parse the links field into a list of (link_text, link_url) tuples."""
        if not self.links:
            return []
        link_pairs = self.links.split(',')
        links = []
        for pair in link_pairs:
            if '|' in pair:
                link_text, link_url = pair.split('|', 1)
                links.append((link_text.strip(), link_url.strip()))
        return links
