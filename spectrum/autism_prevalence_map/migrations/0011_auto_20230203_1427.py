# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2023-02-03 14:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('autism_prevalence_map', '0010_auto_20230131_2050'),
    ]

    operations = [
        migrations.CreateModel(
            name='options',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, default='', max_length=255, null=True)),
                ('value', models.CharField(blank=True, default='', max_length=255, null=True)),
            ],
            options={
                'verbose_name': 'Option',
                'verbose_name_plural': 'Options',
            },
        ),
        migrations.RemoveField(
            model_name='studies',
            name='last_update',
        ),
    ]
