# Generated by Django 5.1.6 on 2025-02-19 13:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0004_product_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='type',
            field=models.CharField(choices=[('blended', 'ปั่น'), ('iced', 'เย็น')], default='blended', max_length=20),
        ),
    ]
