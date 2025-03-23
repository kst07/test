# Generated by Django 5.1.6 on 2025-02-19 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0003_alter_product_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='type',
            field=models.CharField(choices=[('blended', 'ปั่น'), ('iced', 'เย็น')], default='iced', max_length=20),
        ),
    ]
