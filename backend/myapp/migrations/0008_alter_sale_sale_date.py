# Generated by Django 5.1.6 on 2025-02-24 07:20

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_sale_product_sale_quantity_alter_sale_total_price_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='sale_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
