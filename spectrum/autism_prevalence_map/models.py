# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
from datetime import date
from django_ckeditor_5.fields import CKEditor5Field
import re

# Constants
NEWSLETTER_SPECTRUM_WEEKLY_LIST_ID = 2

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
    age_low = models.FloatField(blank=True, null=True)
    age_high = models.FloatField(blank=True, null=True)
    individualswithautism = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Individuals with Autism')
    individualswithautism_number = models.IntegerField(blank=True, null=True)
    diagnosticcriteria = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Diagnostic Criteria')
    diagnostictools = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Diagnostic Tools')
    percentwaverageiq = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Percent w/ Average IQ')
    percentwaverageiq_number = models.FloatField(blank=True, null=True)
    sexratiomf = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Sex ratio (M:F)')
    sexratiomf_number = models.FloatField(blank=True, null=True)
    prevalenceper10000 = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='Prevalence (per 10,000)')
    prevalenceper10000_number = models.FloatField(default=0, blank=True, null=True)
    confidenceinterval = models.CharField(max_length=255, default='', blank=True, null=True, verbose_name='95% Confidence interval')
    confidenceinterval_low = models.FloatField(blank=True, null=True)
    confidenceinterval_high = models.FloatField(blank=True, null=True)
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

    def save(self, *args, **kwargs):
        # Auto-populate numeric fields from text fields
        try:
            if self.individualswithautism:
                value = re.sub(r'[^\d]', '', self.individualswithautism)
                self.individualswithautism_number = int(value) if value else None
        except Exception:
            pass

        try:
            if self.percentwaverageiq:
                match = re.search(r'[-+]?\d*\.?\d+', self.percentwaverageiq)
                self.percentwaverageiq_number = float(match.group()) if match else None
        except Exception:
            pass

        try:
            if self.sexratiomf:
                match = re.search(r'[-+]?\d*\.?\d+', self.sexratiomf)
                self.sexratiomf_number = float(match.group()) if match else None
        except Exception:
            pass

        try:
            if self.confidenceinterval:
                nums = re.findall(r'[-+]?\d*\.?\d+', self.confidenceinterval.replace('–', '-'))
                if len(nums) >= 2:
                    self.confidenceinterval_low = float(nums[0])
                    self.confidenceinterval_high = float(nums[1])
                elif len(nums) == 1:
                    self.confidenceinterval_low = float(nums[0])
                    self.confidenceinterval_high = float(nums[0])
        except Exception:
            pass

        try:
            if self.age:
                nums = re.findall(r'\d*\.?\d+', self.age.replace("–", "-"))
                if len(nums) >= 2:
                    self.age_low = float(nums[0])
                    self.age_high = float(nums[1])
                elif len(nums) == 1:
                    self.age_low = float(nums[0])
                    self.age_high = float(nums[0])
        except Exception:
            pass

        super().save(*args, **kwargs)

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
    meta_thumbnail = models.ImageField(
        upload_to='about_thumbnails/',
        blank=True,
        null=True,
        help_text="Image to use as the social media thumbnail (recommended size: 1200x630 pixels)"
    )

    def __str__(self):
        return self.title

class AboutSection(models.Model):
    class Meta:
        verbose_name = 'About Section'
        verbose_name_plural = 'About Sections'

    SECTION_TYPES = (
        ('section_title', 'Section Title'),
        ('text', 'Text Block'),
        ('toc', 'Table of Contents'),
        ('callout', 'Special Callout'),
        ('newsletter', 'Newsletter'),
    )

    about_page = models.ForeignKey(AboutPage, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES, default='text', help_text="Type of section")
    title = models.CharField(max_length=255, blank=True, help_text="Section title (used for Table of Contents sections)")
    content = CKEditor5Field(blank=True, help_text="Rich text content (used for Text Block and Callout Box sections)")
    order = models.PositiveIntegerField(default=0, help_text="Order of this section")
    links = models.TextField(
        blank=True,
        help_text="Enter links for Table of Contents sections as: link_text|link_url,link_text|link_url"
    )
    section_title_text = models.CharField(
        max_length=255,
        blank=True,
        help_text="Text for the Section Title (used for Section Title sections)"
    )
    section_title_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="ID attribute for the Section Title (used for Section Title sections)"
    )
    newsletter_title = models.CharField(
        max_length=255,
        blank=True,
        default="Sign up for our weekly newsletter.",
        help_text="Title for newsletter section."
    )
    newsletter_support_line = models.CharField(
        max_length=255,
        blank=True,
        default="Catch up on what you may have missed from our recent coverage.",
        help_text="Support copy for newsletter section."
    )
    newsletter_id = models.PositiveIntegerField(
        default=NEWSLETTER_SPECTRUM_WEEKLY_LIST_ID,
        blank=True,
        help_text="Newsletter ID (value: 2 for Spectrum weekly newsletter)"
    )

    # Set the field title in the admin area
    def __str__(self):
        if self.section_type == 'toc':
            return f"{self.title or 'Untitled'} (Table of Contents)"
        elif self.section_type == 'callout':
            return "Special Callout"
        elif self.section_type == 'newsletter':
            return "Newsletter"
        elif self.section_type == 'section_title':
            return "Section Title"
        return "Text Block"

    class Meta:
        ordering = ['order']

    # get the links from text field and parse them into HTML
    def get_links(self):
        if not self.links:
            return []
        link_pairs = self.links.split(',')
        links = []
        for pair in link_pairs:
            if '|' in pair:
                link_text, link_url = pair.split('|', 1)
                links.append((link_text.strip(), link_url.strip()))
        return links

class Footer(models.Model):
    class Meta:
        verbose_name = 'Footer'
        verbose_name_plural = 'Footers'
    
    # Middle section fields
    middle_text = models.TextField(
        default="Have you recently published new research in neuroscience?",
        help_text="Text for the middle section of the footer"
    )
    middle_subtext = models.CharField(
        max_length=255,
        default="We want to hear from you.",
        help_text="Subtext for the middle section of the footer"
    )
    middle_button_text = models.CharField(
        max_length=255,
        default="Let us know",
        help_text="Button text for the middle section"
    )
    middle_button_link = models.URLField(
        max_length=500,
        default="https://www.thetransmitter.org/contact-us/",
        help_text="Button link for the middle section"
    )
    
    # Bottom section text
    bottom_tagline = models.CharField(
        max_length=255,
        default="Curating neuroscience, connecting community",
        help_text="Tagline text below the logo"
    )
    bottom_support_text = models.CharField(
        max_length=255,
        default="An editorially independent publication supported by the Simons Foundation",
        help_text="Support text at the very bottom"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Footer Configuration (Updated: {self.updated_at.strftime('%Y-%m-%d')})"
    
    def save(self, *args, **kwargs):
        # Ensure only one Footer instance exists
        if not self.pk and Footer.objects.exists():
            # If creating a new instance and one already exists, update the existing one
            existing = Footer.objects.first()
            existing.middle_text = self.middle_text
            existing.middle_subtext = self.middle_subtext
            existing.middle_button_text = self.middle_button_text
            existing.middle_button_link = self.middle_button_link
            existing.bottom_tagline = self.bottom_tagline
            existing.bottom_support_text = self.bottom_support_text
            existing.save()
            return existing
        return super().save(*args, **kwargs)

class FooterLeftMenuItem(models.Model):
    class Meta:
        verbose_name = 'Footer Left Menu Item'
        verbose_name_plural = 'Footer Left Menu Items'
        ordering = ['order']
    
    footer = models.ForeignKey(
        Footer,
        on_delete=models.CASCADE,
        related_name='left_menu_items'
    )
    title = models.CharField(
        max_length=255,
        help_text="Menu item title (HTML allowed, e.g., <em>The Transmitter</em> books)"
    )
    url = models.URLField(
        max_length=500,
        help_text="Menu item URL"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of this menu item (lower numbers appear first)"
    )
    
    def __str__(self):
        return self.title

class FooterRightMenuItem(models.Model):
    class Meta:
        verbose_name = 'Footer Right Menu Item'
        verbose_name_plural = 'Footer Right Menu Items'
        ordering = ['order']
    
    footer = models.ForeignKey(
        Footer,
        on_delete=models.CASCADE,
        related_name='right_menu_items'
    )
    title = models.CharField(
        max_length=255,
        help_text="Menu item title (HTML allowed, e.g., About <em>The Transmitter</em>)"
    )
    url = models.URLField(
        max_length=500,
        help_text="Menu item URL"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of this menu item (lower numbers appear first)"
    )
    
    def __str__(self):
        return self.title
